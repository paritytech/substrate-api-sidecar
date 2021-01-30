import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';

import {
	EventAnnotated,
	EventWithAccountInfo,
	KeyInfo,
	PalletKeyInfo,
	ParentSpanId,
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
};

export class Trace {
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
	}

	private traceInfoByPhase(): TracesByPrimarySpan {
		const spansById = this.spansById();
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
		const primarySpans = [...spansById.values()].filter(
			(span) => span.parent_id === execute_block_span.id
		);
	}

	private spansById(): Map<number, SpanWithStoragePath> {
		return this.traceBlock.spans
			.map((s) => {
				const { key } = s.values.string_values;
				const storagePath = this.getStoragePathFromKey(key);

				return { ...s, storagePath };
			})
			.reduce((acc, cur) => {
				acc.set(cur.id, cur);
				return acc;
			}, new Map<number, SpanWithStoragePath>());
	}

	private eventsAnnotated(): EventAnnotated[] {
		const spansById = this.spansById();
		return this.traceBlock.events
			.map((e) => {
				const { key } = e.values.string_values;
				const keyPrefix = key?.slice(0, 64);
				const storagePath = this.getStoragePathFromKey(keyPrefix);

				return { ...e, storagePath };
			})
			.map((e) => {
				const p = spansById.get(e.parent_id);
				const parentSpanId = {
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
