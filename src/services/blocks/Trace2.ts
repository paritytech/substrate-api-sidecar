import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';

import {
	EventAnnotated,
	EventWithAccountInfo,
	KeyInfo,
	PalletKeyInfo,
	Phase,
	SpansWithChildren,
	SpanWithChildren,
	// ParentSpanId,
	SpanWithStoragePath,
	TraceBlock,
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
		name: 'on_initialize'
		// Targets vary by pallet
	},
	onFinalize: {
		name: 'on_finalize'
		// Targets vary by pallet
	}
};

export class Trace2 {
	/**
	 * Known storage keys.
	 */
	private keyNames;
	private spansById: Map<number, SpanWithChildren>;
	private annotatedEvents;
	constructor(
		private api: ApiPromise,
		private traceBlock: TraceBlock,
		private registry: Registry
	) {
		this.keyNames = this.getKeyNames();
		this.spansById = this.getSpansById();
		this.annotatedEvents = this.getAnnotatedEvents();
		this.traceInfoByPhase();
		try {
			this.annotatedToSysemAccount(
				(undefined as unknown) as EventAnnotated
			);
		} catch {
			// this is just here to make compiler happy
		}
	}

	// private traceInfoByPhase(): TracesByPrimarySpan {
	private traceInfoByPhase(): any {
		const eventsByParentId = this.eventsByParentId();
		const spansById = this.spansById;
		// find execute block span
		const execute_block_span = [...spansById.values()].find(
			({ name, target }) =>
				SPANS.executeBlock.name === name &&
				SPANS.executeBlock.target === target
		);
		if (!execute_block_span) {
			throw new Error('execute_block_span could not be found');
		}
		// Gather primary spans spans with parentId == execute_block
		const phaseInfoGather = [...spansById.values()]
			.filter((span) => span.parent_id === execute_block_span.id)
			.map((primary) => {
				const secondarySpanIds = this.findDescendants(primary.id);
				const secondarySpanEvents = [];
				secondarySpanIds.forEach((id) => {
					const events = eventsByParentId.get(id);
					events && secondarySpanEvents.push(...events);
				});

				let phase;
				if (
					primary.name === SPANS.applyExtrinsic.name &&
					primary.target === SPANS.applyExtrinsic.target
				) {
					phase = Phase.ApplyExtrinsic,
				} else if(
					primary.name === SPANS.onInitialize.name
				) {
					phase = Phase.OnInitialze
				} else if {
					primary.name === SPANS.onFinalize.name
				}
					// Get a primary span, and all associated descendant spans and events
					return {
						primarySpan: primary,
						secondarySpanIds,
						primarySpanEvents: eventsByParentId.get(primary.id),
					};
			});

		return phaseInfoGather;
	}

	private eventsByParentId(): Map<number, EventAnnotated[]> {
		return this.annotatedEvents.reduce((acc, cur) => {
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
		const stack = this.spansById.get(root)?.children;
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
			const curSpanChildren = this.spansById.get(curId)?.children;
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

		spansById.forEach((span, _, map) => {
			if (!span.parent_id) {
				return;
			}
			// Warning: in place mutation
			map.get(span.parent_id)?.children.push(span.id);
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
				const p = this.spansById.get(e.parent_id);
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
	 * Convert an `EventAnnotated` to a `EventWithAccountInfo`. Will throw if event
	 * does not have system::account storagePath
	 *
	 * @param e EventAnnotated
	 */
	private annotatedToSysemAccount(
		event: EventAnnotated
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
}
