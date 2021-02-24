import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import * as BN from 'bn.js';

import {
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
	TraceBlock,
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
		private traceBlock: TraceBlock,
		private registry: Registry
	) {
		this.keyNames = this.getKeyNames();
		try {
			this.annotatedToSysemAccount(
				(undefined as unknown) as EventWithPhase
			);
		} catch {
			// this is just here to make compiler happy
		}

		this.systemAccountEventByAddress([]);
		this.getOperations(new Map());
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

		operations.sort((a, b) => a.id.eventIndex - b.id.eventIndex);

		return {
			operations,
			primaryGrouping,
		};
	}

	traceInfoWithPhaseAndOperations(): PhaseTraceInfoWithOps[] {
		return this.traceInfoWithPhase().map((tiwp) => {
			const accountInfoEvents = this.systemAccountEventByAddress(
				tiwp.events
			);

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
				SPANS.executeBlock.name === name &&
				SPANS.executeBlock.target === target
		);
		if (!execute_block_span) {
			throw new Error('execute_block_span could not be found');
		}

		// This is broken up into its own variable because it may be good for debugging
		const phaseInfoGather = [...spansById.values()]
			.filter((span) => span.parent_id === execute_block_span.id) // Gather primary spans spans with parentId == execute_block
			.sort((a, b) => a.entered[0].nanos - b.entered[0].nanos) // TODO double check nanos is the correct thing to sort on
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
				let phase: Phase, extrinsicIndex: BN | undefined;
				if (
					primary.name === SPANS.applyExtrinsic.name &&
					primary.target === SPANS.applyExtrinsic.target // this might be unnescary
				) {
					const maybeExtrinsicIndex = secondarySpanIds
						.concat(primary.id)
						.filter((id) => extrinsicIndexBySpanId.has(id))
						.map((id) => extrinsicIndexBySpanId.get(id));
					if (maybeExtrinsicIndex.length !== 1) {
						throw new Error(
							'Expect exactly one extrinsic index per apply extrinsic span grouping'
						);
					}

					phase = Phase.ApplyExtrinsic;
					extrinsicIndex = maybeExtrinsicIndex[0];
				} else if (primary.name === SPANS.onInitialize.name) {
					phase = Phase.OnInitialze;
				} else if (primary.name === SPANS.onFinalize.name) {
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

	private extrinsicIndexBySpanId(): Map<number, BN> {
		return this.getAnnotatedEvents()
			.filter((e) => {
				return (
					// Note: there are many read and writes of extrinsic_index per extrinsic so take care
					// when modifying this logic
					(e.storagePath as SpecialKeyInfo).special ===
						':extrinsic_index' &&
					// I assume this second part will always be true but here for clarity
					e.parentSpanId?.name === SPANS.applyExtrinsic.name &&
					// super important we only do `get`, `set` ops are prep for next extrinsic
					e.values.string_values.message == 'get'
				);
			})
			.reduce((acc, cur) => {
				const indexEncoded = cur.values.string_values.res;
				let extrinsicIndex;
				if (indexEncoded?.slice(0, 5) === 'Some(') {
					const len = indexEncoded.length;
					const scale = indexEncoded
						.slice(5, len - 1)
						.match(/.{1,2}/g)
						?.reverse()
						.join('');
					const hex = `0x${scale}`;
					extrinsicIndex = this.registry.createType('u32', hex);
				} else {
					extrinsicIndex = this.registry.createType('u32', 0);
				}
				acc.set(cur.parent_id, extrinsicIndex.toBn());

				return acc;
			}, new Map<number, BN>());
	}

	private eventsByParentId(): Map<number, EventAnnotated[]> {
		return this.getAnnotatedEvents().reduce((acc, cur) => {
			if (!acc.has(cur.parent_id)) {
				acc.set(cur.parent_id, [cur]);
			} else {
				acc.get(cur.parent_id)?.push(cur);
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
	private getSpansById(): Map<number, SpanWithChildren> {
		const spansById = this.traceBlock.spans
			.map((s) => {
				const { key } = s.values.string_values;
				const storagePath = this.getStoragePathFromKey(key);

				return { ...s, storagePath, children: [] };
			})
			.reduce((acc, cur) => {
				acc.set(cur.id, cur);
				return acc;
			}, new Map<number, SpanWithChildren>());

		[...spansById.values()].forEach((span) => {
			if (!span.parent_id) {
				return;
			}
			if (!spansById.has(span.parent_id)) {
				throw new Error('Spans Parens should exist in spansById');
			}
			// Warning: in place mutation
			spansById.get(span.parent_id)?.children.push(span.id);
		});

		return spansById;
	}

	getAnnotatedEvents(): EventAnnotated[] {
		return this.traceBlock.events
			.map((e) => {
				const { key } = e.values.string_values;
				const keyPrefix = key?.slice(0, 64);
				const storagePath = this.getStoragePathFromKey(keyPrefix);

				return { ...e, storagePath };
			})
			.map((e) => {
				const p = this.getSpansById().get(e.parent_id);
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
	private systemAccountEventByAddress(
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
	 * Convert an `EventAnnotated` to a `EventWithAccountInfo`. Will throw if event
	 * does not have system::account storagePath
	 *
	 * @param e EventAnnotated
	 */
	private annotatedToSysemAccount(
		event: EventWithPhase
	): EventWithAccountInfo {
		const { storagePath } = event;
		if (
			!(
				(storagePath as PalletKeyInfo).module == 'system' &&
				(storagePath as PalletKeyInfo).item == 'account'
			)
		) {
			throw new Error(
				'Event did not have system::account path as expected'
			);
		}

		// key = h(system) + h(account) + h(address) + address
		// Remove the storage key + account hash
		const addressRaw = event.values.string_values.key?.slice(96) as string;
		const address = this.registry.createType('Address', `0x${addressRaw}`);

		const method = event?.values?.string_values?.message;
		const accountInfoEncoded =
			method === 'clear'
				? 'account-cleared' // likely dusted
				: (event?.values?.string_values?.res as string);

		let accountInfo;
		try {
			if (method === 'clear') {
				// Account was likely dusted. For now lets just assume we are ok with the account balance
				// being zero. In the future this can have richer information
				accountInfo = this.registry.createType('AccountInfo');
			} else if (accountInfoEncoded.includes('None')) {
				accountInfo = this.registry.createType('AccountInfo');
			} else if (accountInfoEncoded?.slice(0, 5) === 'Some(') {
				const len = accountInfoEncoded.length;
				const scale = accountInfoEncoded.slice(5, len - 1);

				accountInfo = (this.registry.createType(
					'AccountInfo',
					`0x${scale}`
				) as unknown) as AccountInfo;
			} else {
				accountInfo = (this.registry.createType(
					'AccountInfo',
					`0x${accountInfoEncoded}`
				) as unknown) as AccountInfo;
			}
		} catch {
			throw new Error('Expect there to always be some AccountInfo');
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
			((key && this.keyNames[key?.slice(0, 64)]) as KeyInfo) ||
			EMPTY_KEY_INFO
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
					id: {
						phase: e.phase,
						parentSpanId: e.parentSpanId,
						primarySpanId: e.primarySpanId,
						eventIndex: e.eventIndex,
					},
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
			.sort((a, b) => a.id.eventIndex - b.id.eventIndex);

		return sorted.map((t, index) => {
			return {
				...t,
				id: {
					...t.id,
					operationIndex: index, // TODO these need to relative to all ops?
				},
			} as Operation;
		});
	}
}
