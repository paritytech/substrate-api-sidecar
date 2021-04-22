import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import {
	BlockTrace,
	EventAnnotated,
	EventWithAccountInfo,
	EventWithPhase,
	KeyInfo,
	Operation,
	PalletKeyInfo,
	Phase,
	PhaseTraceInfoGather,
	PhaseTraceInfoWithOps,
	SpanWithChildren,
	SpecialKeyInfo,
	TraceSpan,
	Transition,
} from './types';

const EMPTY_KEY_INFO = {
	error: 'key not found',
};

/**
 * Known spans
 */
const SPANS = {
	executeBlock: {
		name: 'execute_block',
		target: 'frame_executive',
	},
	applyExtrinsic: {
		name: 'apply_extrinsic',
		target: 'frame_executive',
	},
	onInitialize: {
		name: 'on_initialize',
		// Targets vary by pallet
	},
	onFinalize: {
		name: 'on_finalize',
		// Targets vary by pallet
	},
};

// TODO In the future this will need a more chain specific solution that creates
// keys directly from expanded metadata.
/**
 * Get all the storage key names.
 *
 * @param api ApiPromise
 */
function getKeyNames(api: ApiPromise): Record<string, KeyInfo> {
	const moduleKeys = Object.keys(api.query).reduce((acc, mod) => {
		Object.keys(api.query[mod]).forEach((item) => {
			const queryObj = api.query[mod][item];
			let key;
			try {
				// Slice off '0x' prefix
				key = queryObj.key().slice(2);
			} catch {
				key = queryObj.keyPrefix().slice(2);
			}

			acc[key] = {
				module: mod,
				item,
			};
		});

		return acc;
	}, {} as Record<string, KeyInfo>);

	const wellKnownKeys = {
		'3a636f6465': {
			special: ':code',
		},
		'3a686561707061676573': {
			special: ':heappages',
		},
		'3a65787472696e7369635f696e646578': {
			special: ':extrinsic_index',
		},
		'3a6368616e6765735f74726965': {
			special: ':changes_trie',
		},
		'3a6368696c645f73746f726167653a': {
			special: ':child_storage:',
		},
	};

	return { ...moduleKeys, ...wellKnownKeys };
}

/**
 * Create a Map of span's `id` to the the span in format `SpanWithChildren`,
 * filling out each spans children as we go along
 *
 * @param spans spans to create a id => span mapping of.
 */
function getSpansById(spans: TraceSpan[]): Map<number, SpanWithChildren> {
	const spansById = spans.reduce((acc, cur) => {
		const spanWithChildren = { ...cur, children: [] };
		acc.set(cur.id, spanWithChildren);
		return acc;
	}, new Map<number, SpanWithChildren>());

	// Go through each span, and add its Id to the `children` array of its
	// parent span, creating tree of spans starting with `execute_block` span as
	// the root.
	[...spansById.values()].forEach((span) => {
		if (!span.parentId) {
			return;
		}
		if (!spansById.has(span.parentId)) {
			throw new Error('Spans Parens should exist in spansById');
		}

		// Warning: in place mutation
		spansById.get(span.parentId)?.children.push(span.id);
	});

	return spansById;
}

/**
 * Find the Ids of al the descendant spans of `root`
 *
 * @param root span which we want all the descendants of
 * @param spansById map of span id => span with children
 */
function findDescendants(
	root: number,
	spansById: Map<number, SpanWithChildren>
): number[] {
	// Note: traversal order doesn't matter here
	const stack = spansById.get(root)?.children;
	if (!stack) {
		return [];
	}

	const descendants = [];
	while (stack.length) {
		const curId = stack.pop();
		if (!curId) {
			break;
		}

		descendants.push(curId);

		const curSpanChildren = spansById.get(curId)?.children;
		curSpanChildren && stack.push(...curSpanChildren);
	}

	return descendants;
}

function getEventsByParentId(
	annotatedEvents: EventAnnotated[]
): Map<number, EventAnnotated[]> {
	return annotatedEvents.reduce((acc, cur) => {
		if (!acc.has(cur.parentId)) {
			acc.set(cur.parentId, [cur]);
		} else {
			acc.get(cur.parentId)?.push(cur);
		}

		return acc;
	}, new Map<number, EventAnnotated[]>());
}

export class Trace {
	/**
	 * Known storage keys.
	 */
	private keyNames;
	constructor(
		api: ApiPromise,
		private traceBlock: BlockTrace,
		private registry: Registry
	) {
		this.keyNames = getKeyNames(api);
	}

	operationsAndGrouping(): {
		primaryGrouping: PhaseTraceInfoWithOps[];
		operations: Operation[];
	} {
		const primaryGrouping = this.traceInfoWithPhaseAndOperations();

		const operations: Operation[] = [];
		primaryGrouping.forEach((g) => {
			// Flattening
			operations.push(...g.operations);
		});

		return {
			operations,
			primaryGrouping,
		};
	}

	traceInfoWithPhaseAndOperations(): PhaseTraceInfoWithOps[] {
		return this.traceInfoWithPhase().map((tiwp) => {
			const accountInfoEvents = this.systemAccountEventByAddress(tiwp.events);

			return {
				...tiwp,
				accountInfoEvents,
				operations: this.getOperations(accountInfoEvents),
			};
		});
	}

	traceInfoWithPhase(): PhaseTraceInfoGather[] {
		const spansById = getSpansById(this.traceBlock.spans);
		const annotatedEvents = this.getAnnotatedEvents(spansById);
		const eventsByParentId = getEventsByParentId(annotatedEvents);
		const extrinsicIndexBySpanId = this.extrinsicIndexBySpanId(annotatedEvents);
		// find execute block span
		const execute_block_span = [...spansById.values()].find(
			({ name, target }) =>
				SPANS.executeBlock.name === name && SPANS.executeBlock.target === target
		);
		if (!execute_block_span) {
			throw new InternalServerError('execute_block span could not be found');
		}

		return (
			[...spansById.values()] // TODO this would probably be faster as a for-of loop
				.reduce((acc, primary) => {
					// Only use primary spans (spans where parentId === execute_block)
					if (!(primary.parentId === execute_block_span.id)) {
						return acc;
					}

					const secondarySpanIds = findDescendants(primary.id, spansById);
					const secondarySpanEvents: EventAnnotated[] = [];
					const secondarySpans: SpanWithChildren[] = [];
					secondarySpanIds.forEach((id) => {
						const events = eventsByParentId.get(id);
						const span = spansById.get(id);

						events && secondarySpanEvents.push(...events);
						span && secondarySpans.push(span);
					});

					// Figure out the phase and potentially the extrinsic index
					// TODO get phase from an events parent span
					let phase: Phase, extrinsicIndex: BN | undefined;
					if (primary.name === SPANS.applyExtrinsic.name) {
						// Add the primary spanId so we can check it for primary span
						const maybeExtrinsicIndex = secondarySpanIds
							.concat(primary.id)
							.reduce((acc, id) => {
								if (!extrinsicIndexBySpanId.has(id)) {
									return acc;
								}

								acc.push(extrinsicIndexBySpanId.get(id) as BN);
								return acc;
							}, [] as BN[]);

						if (maybeExtrinsicIndex.length > 1) {
							for (const [i, extIdx] of maybeExtrinsicIndex.entries()) {
								if (i > 0 && !maybeExtrinsicIndex[i]?.eq(extIdx)) {
									throw new Error(
										'Expect extrinsic to only be applied at a single index.'
									);
								}
							}
						}

						phase = Phase.ApplyExtrinsic;
						extrinsicIndex = maybeExtrinsicIndex[0];
					} else if (secondarySpans[0]?.name === SPANS.onInitialize.name) {
						// onFinalize and onInitialize should always be the only secondary spans
						// in there action grouping
						phase = Phase.OnInitialze;
					} else if (secondarySpans[0]?.name === SPANS.onFinalize.name) {
						phase = Phase.OnFinalize;
					} else {
						phase = Phase.Other;
					}

					// TODO this logic shouldn't be here
					const primarySpanEvents = eventsByParentId.get(primary.id);
					const events =
						primarySpanEvents
							?.concat(secondarySpanEvents)
							.sort((a, b) => a.eventIndex - b.eventIndex) || [];

					const eventsWithPhaseInfo = events.map((e) => {
						return {
							...e,
							phase: {
								variant: phase,
								applyExtrinsicIndex: extrinsicIndex as BN,
							},
							primarySpanId: {
								id: primary.id,
								name: primary.name,
								target: primary.target,
							},
						};
					});

					// Get a primary span, and all associated descendant spans and events
					acc.push({
						extrinsicIndex,
						phase,
						primarySpan: primary,
						secondarySpans,
						events: eventsWithPhaseInfo,
					});

					return acc;
				}, [] as PhaseTraceInfoGather[])
				// Ensure they are in order so we know that operations from each action
				// grouping can later be lined up
				// TODO double check if this sort is neccesary
				.sort((a, b) => a.primarySpan.id - b.primarySpan.id)
		);
	}

	extrinsicIndexBySpanId(annotateEvents: EventAnnotated[]): Map<number, BN> {
		return annotateEvents
			.filter((e) => {
				return (
					// Note: there are many read and writes of extrinsic_index per extrinsic so take care
					// when modifying this logic
					(e.storagePath as SpecialKeyInfo).special === ':extrinsic_index' &&
					// I assume this second part will always be true but here for clarity
					// e.parentSpanId?.name === SPANS.applyExtrinsic.name &&
					// // super important we only do `get`, `set` ops are prep for next extrinsic
					e.data.stringValues.method == 'Get'
				);
			})
			.reduce((acc, cur) => {
				const indexEncodedOption = cur.data.stringValues.result;
				let extrinsicIndex;
				if (typeof indexEncodedOption == 'string') {
					const scale = indexEncodedOption
						.slice(2) // Slice of leading option bits beacus they cause trouble
						.match(/.{1,2}/g) // reverse the order of the bytes for correct endian-ness
						?.reverse()
						.join('');
					const hex = `0x${scale}`;
					extrinsicIndex = this.registry.createType('u32', hex);
				} else {
					// TODO this can probably be remove, we can just create with `0x` when this is None
					extrinsicIndex = this.registry.createType('u32', 0);
				}
				acc.set(cur.parentId, extrinsicIndex.toBn());

				return acc;
			}, new Map<number, BN>());
	}

	getAnnotatedEvents(
		spansById: Map<number, SpanWithChildren>
	): EventAnnotated[] {
		return this.traceBlock.events.map((e, idx) => {
			const { key } = e.data.stringValues;
			const keyPrefix = key?.slice(0, 64);
			const storagePath = this.getStoragePathFromKey(keyPrefix);

			const p = spansById.get(e.parentId);
			const parentSpanId = p && {
				name: p.name,
				target: p.target,
				id: p.id,
			};

			return { ...e, storagePath, parentSpanId, eventIndex: idx };
		});
	}

	/**
	 * Create a mapping adress => Account events for that address based on an
	 * array of all the events.
	 *
	 * Note: Assume passed in events are already sorted.
	 *
	 * @param events events with phase info
	 * @returns
	 */
	systemAccountEventByAddress(
		events: EventWithPhase[]
	): Map<string, EventWithAccountInfo[]> {
		return events.reduce((acc, cur) => {
			if (
				!(
					(cur.storagePath as PalletKeyInfo).module == 'system' &&
					(cur.storagePath as PalletKeyInfo).item == 'account'
				)
			) {
				// filter out non system::account events
				return acc;
			}
			// Add account info to the event.
			const curAsAccount = this.annotatedToSysemAccount(cur);

			const address = curAsAccount.address.toString();
			if (!acc.has(address)) {
				acc.set(address, []);
			}

			acc.get(address)?.push(curAsAccount);

			return acc;
		}, new Map<string, EventWithAccountInfo[]>()); // TODO: does this need to be a map?
	}

	/**
	 * Convert an `EventWithPhase` to a `EventWithAccountInfo`. Will throw if event
	 * does not have system::account storagePath
	 *
	 * @param event EventAnnotated
	 */
	private annotatedToSysemAccount(event: EventWithPhase): EventWithAccountInfo {
		const { storagePath } = event;
		if (
			!(
				(storagePath as PalletKeyInfo).module == 'system' &&
				(storagePath as PalletKeyInfo).item == 'account'
			)
		) {
			throw new Error('Event did not have system::account path as expected');
		}

		// key = h(system) + h(account) + h(address) + address
		// Since this is a transparent key with the address at the end we can pull out the address from the key.
		const addressRaw = event.data.stringValues.key?.slice(96) as string; // Remove the storage key + account hash
		const address = this.registry.createType('Address', `0x${addressRaw}`);

		const accountInfoEncoded = event?.data?.stringValues?.result;
		let accountInfo;
		if (typeof accountInfoEncoded === 'string') {
			accountInfo = (this.registry.createType(
				'AccountInfo',
				`0x${accountInfoEncoded.slice(2)}` // cutting off the Option byte - need to check why this is neccesary
			) as unknown) as AccountInfo;
		} else {
			throw Error(
				'Expect accountInfoEncoded to always be a string in system::Account event'
			);
		}

		return { ...event, accountInfo, address };
	}

	// Util-ish methods

	private getStoragePathFromKey(key?: string): KeyInfo {
		return (
			((key && this.keyNames[key?.slice(0, 64)]) as KeyInfo) || EMPTY_KEY_INFO
		);
	}

	private getOperations(
		accountEventsByAddress: Map<string, EventWithAccountInfo[]>
	): Operation[] {
		const es = [...accountEventsByAddress.entries()];
		const ts = es.reduce((acc, [addr, events]) => {
			const transitions = [];
			for (const [i, e] of events.entries()) {
				if (i === 0) {
					continue;
				}

				const prev = events[i - 1].accountInfo.data;
				// const prev = events[i - 1].accountInfo as any;
				const cur = e.accountInfo.data;
				// const cur = e.accountInfo as any;

				const free = cur.free.sub(prev.free);
				const reserved = cur.reserved.sub(prev.reserved);
				const miscFrozen = cur.miscFrozen.sub(prev.miscFrozen);
				const feeFrozen = cur.feeFrozen.sub(prev.feeFrozen);

				const baseInfo = {
					phase: e.phase,
					parentSpanId: e.parentSpanId,
					primarySpanId: e.primarySpanId,
					eventIndex: e.eventIndex,
					address: e.address,
				};
				const currency = {
					symbol: this.registry.chainTokens[0],
				};
				const systemAccountData = {
					pallet: 'system',
					item: 'Account',
				};

				if (!free.eqn(0)) {
					transitions.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field: 'data.free',
						},
						amount: {
							value: free,
							currency,
						},
					});
				}
				if (!reserved.eqn(0)) {
					transitions.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field: 'data.reserved',
						},
						amount: {
							value: reserved,
							currency,
						},
					});
				}
				if (!miscFrozen.eqn(0)) {
					transitions.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field: 'data.miscFrozen',
						},
						amount: {
							value: miscFrozen,
							currency,
						},
					});
				}
				if (!feeFrozen.eqn(0)) {
					transitions.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field: 'data.feeFrozen',
						},
						amount: {
							value: feeFrozen,
							currency,
						},
					});
				}
			}

			acc.set(addr, transitions);

			return acc;
		}, new Map<string, Transition[]>());

		const sorted = [...ts.values()]
			.flat()
			// // TODO should actually already be sorted // maybe can add a test here
			.sort((a, b) => a.eventIndex - b.eventIndex);

		return sorted.map((t, index) => {
			return {
				...t,
				operationIndex: index, // TODO these need to relative to all ops?
			} as Operation;
		});
	}
}
