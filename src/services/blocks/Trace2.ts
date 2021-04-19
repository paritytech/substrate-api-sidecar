import { ApiPromise } from '@polkadot/api';
// import { Option } from '@polkadot/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import * as BN from 'bn.js';

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

export class Trace2 {
	/**
	 * Known storage keys.
	 */
	private keyNames;
	constructor(
		private api: ApiPromise,
		private traceBlock: BlockTrace,
		private registry: Registry
	) {
		this.keyNames = this.getKeyNames();
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

		const check = [...operations];

		operations.sort((a, b) => a.eventIndex - b.eventIndex);

		if (check.toLocaleString() === operations.toString()) {
			console.log('Trace: Operartions where already in correct order');
		} else {
			console.error('Trace: Operations where not in correct order');
		}

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
		const eventsByParentId = this.eventsByParentId();

		const extrinsicIndexBySpanId = this.extrinsicIndexBySpanId();

		const spansById = this.getSpansById();
		// find execute block span
		const execute_block_span = [...spansById.values()].find(
			({ name, target }) =>
				SPANS.executeBlock.name === name && SPANS.executeBlock.target === target
		);
		if (!execute_block_span) {
			throw new Error('execute_block_span could not be found');
		}

		// This is broken up into its own variable because it may be good for debugging
		const phaseInfoGather = [...spansById.values()]
			.filter((span) => span.parentId === execute_block_span.id) // Gather primary spans spans with parentId == execute_block
			// .sort((a, b) => a.entered[0].nanos - b.entered[0].nanos) // TODO double check nanos is the correct thing to sort on
			.sort((a, b) => a.id - b.id) // TODO double check nanos is the correct thing to sort on
			.map((primary) => {
				// Based on primary spans gather all there descendant info
				const secondarySpanIds = this.findDescendants(primary.id);
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
				if (
					primary.name === SPANS.applyExtrinsic.name &&
					primary.target === SPANS.applyExtrinsic.target // this might be unnescary
				) {
					const maybeExtrinsicIndex = secondarySpanIds
						.concat(primary.id)
						.filter((id) => extrinsicIndexBySpanId.has(id))
						.map((id) => extrinsicIndexBySpanId.get(id) as BN);

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
				return {
					extrinsicIndex,
					phase,
					primarySpan: primary,
					secondarySpans,
					events: eventsWithPhaseInfo,
				};
			});

		return phaseInfoGather;
	}

	extrinsicIndexBySpanId(): Map<number, BN> {
		return this.getAnnotatedEvents()
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

	private eventsByParentId(): Map<number, EventAnnotated[]> {
		return this.getAnnotatedEvents().reduce((acc, cur) => {
			if (!acc.has(cur.parentId)) {
				acc.set(cur.parentId, [cur]);
			} else {
				acc.get(cur.parentId)?.push(cur);
			}

			return acc;
		}, new Map<number, EventAnnotated[]>());
	}

	private findDescendants(root: number): number[] {
		// Note: traversal order doesn't matter here
		const stack = this.getSpansById().get(root)?.children;
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
			const curSpanChildren = this.getSpansById().get(curId)?.children;
			curSpanChildren && stack.push(...curSpanChildren);
		}

		return descendants;
	}

	/**
	 * Map of span's `id` to the the span in format `SpanWithChildren`
	 * @returns
	 */
	getSpansById(): Map<number, SpanWithChildren> {
		const spansById = this.traceBlock.spans
			.map((s) => {
				// const { key } = s.data.string_values;
				// const storagePath = this.getStoragePathFromKey(key);

				return { ...s, children: [] };
				// return { ...s, storagePath, children: [] };
			})
			.reduce((acc, cur) => {
				acc.set(cur.id, cur);
				return acc;
			}, new Map<number, SpanWithChildren>());

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

	getAnnotatedEvents(): EventAnnotated[] {
		return this.traceBlock.events
			.map((e) => {
				const { key } = e.data.stringValues;
				const keyPrefix = key?.slice(0, 64);
				const storagePath = this.getStoragePathFromKey(keyPrefix);

				return { ...e, storagePath };
			})
			.map((e) => {
				const p = this.getSpansById().get(e.parentId);
				const parentSpanId = p && {
					name: p.name,
					target: p.target,
					id: p.id,
				};

				return { ...e, parentSpanId };
			})
			.map((e, idx) => {
				return {
					...e,
					eventIndex: idx,
				};
			});
	}

	/**
	 * Assume passed in events are already sorted
	 *
	 * @param events
	 * @returns
	 */
	systemAccountEventByAddress(
		events: EventWithPhase[]
	): Map<string, EventWithAccountInfo[]> {
		return events
			.filter(
				({ storagePath }) =>
					(storagePath as PalletKeyInfo).module == 'system' &&
					(storagePath as PalletKeyInfo).item == 'account'
			)
			.map((event) => this.annotatedToSysemAccount(event))
			.reduce((acc, cur) => {
				const addr = cur.address.toString();
				if (!acc.has(addr)) {
					acc.set(addr, []);
				}

				acc.get(addr)?.push(cur);

				return acc;
			}, new Map<string, EventWithAccountInfo[]>());
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
		try {
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
		} catch {
			// TODO this catch is no longer neccesary
			throw new Error(
				'Expect there to always be Option<AccountInfo> in system::Account event'
			);
		}

		return { ...event, accountInfo, address };
	}

	// Util-ish methods
	private getKeyNames() {
		const result = {};
		Object.keys(this.api.query).forEach((mod) => {
			Object.keys(this.api.query[mod]).forEach((item) => {
				const queryObj = this.api.query[mod][item];
				let key;
				try {
					// Slice off '0x' prefix
					key = queryObj.key().slice(2);
				} catch {
					key = queryObj.keyPrefix().slice(2);
				}

				result[key] = {
					module: mod,
					item,
				};
			});
		});

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

		return { ...result, ...wellKnownKeys };
	}

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
