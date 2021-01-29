/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiPromise } from '@polkadot/api';
import { AccountInfo, Address } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';

// import * as BN from 'bn.js';
import {
	KeyInfo,
	Operation,
	PalletKeyInfo,
	ParentSpanId,
	TraceBlock,
	TraceEvent,
	TraceSpan,
	Transition,
} from './types';

type SpanWithName = TraceSpan & { storagePath: KeyInfo };

type EventWithName = TraceEvent & { storagePath: KeyInfo };

type EventWithParent = EventWithName & { parentSpanId: ParentSpanId[] };

type EventFullAnnotated = EventWithParent & { eventIndex: number };

type EventWithAccountInfo = EventFullAnnotated & {
	accountInfo: AccountInfo;
	address: Address;
};

// interface AccountTransitionInfo {
// 	parentSpanId: ParentSpanId[];
// 	eventIndex: number;
// 	address: Address;
// 	free: BN;
// 	reserved: BN;
// 	miscFrozen: BN;
// 	feeFrozen: BN;
// }

export interface TraceTestOne {
	// onlySystemAccount: EventWithAccountInfo[];
	// Spans grouped by Id
	spansById: Map<number, SpanWithName[]>;
	// Events grouped by parent_id
	eventsByParent: Map<number, EventWithParent[]>;
}

export interface TraceTestTwo {
	systemAccountTransitions: Map<string, Transition[]>;
	systemAccountByAddress: Map<string, EventWithAccountInfo[]>;
	onlySystemAccount: EventWithAccountInfo[];
}

export interface TraceTestThree {
	operations: Operation[];
}

const EMPTY_KEY_INFO = {
	error: 'key not found',
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

	testOne(): TraceTestOne {
		return {
			// onlySystemAccount: this.systemAccountEvents(),
			spansById: this.spansById(),
			eventsByParent: this.eventsByParentId(),
		};
	}

	testTwo(): TraceTestTwo {
		return {
			systemAccountTransitions: this.transitionPerAccount(),
			systemAccountByAddress: this.accountEventsByAddress(),
			onlySystemAccount: this.systemAccountEvents(),
		};
	}

	testThree(): TraceTestThree {
		return {
			operations: this.operations(),
		};
	}

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

	private spansWithName(): SpanWithName[] {
		return this.traceBlock.spans.map((s) => {
			const { key } = s.values.string_values;
			const storagePath =
				(key && (this.keyNames[key?.slice(0, 64)] as KeyInfo)) ||
				EMPTY_KEY_INFO;

			return { ...s, storagePath };
		});
	}

	private spansById(): Map<number, SpanWithName[]> {
		return this.spansWithName().reduce((acc, cur) => {
			if (!acc.has(cur.id)) {
				acc.set(cur.id, []);
			}

			acc.get(cur.id)?.push(cur);

			return acc;
		}, new Map<number, SpanWithName[]>());
	}

	private eventsWithName(): EventFullAnnotated[] {
		const spansById = this.spansById();
		return this.traceBlock.events
			.map((e) => {
				const { key } = e.values.string_values;
				const keyPrefix = key?.slice(0, 64);

				const storagePath =
					(keyPrefix && (this.keyNames[keyPrefix] as KeyInfo)) ||
					EMPTY_KEY_INFO;

				return { ...e, storagePath };
			})
			.map((e) => {
				const parentSpanId: ParentSpanId[] =
					spansById.get(e.parent_id)?.map((p) => {
						return {
							name: p.name,
							target: p.target,
							id: p.id,
						};
					}) || [];

				return { ...e, parentSpanId };
			})
			.map((e, idx) => {
				return {
					...e,
					eventIndex: idx,
				};
			});
	}

	private eventsByParentId(): Map<number, EventWithParent[]> {
		return this.eventsWithName().reduce((acc, cur) => {
			if (!acc.has(cur.parent_id)) {
				acc.set(cur.parent_id, []);
			}

			acc.get(cur.parent_id)?.push(cur);

			return acc;
		}, new Map<number, EventWithParent[]>());
	}

	private systemAccountEvents(): EventWithAccountInfo[] {
		return this.eventsWithName()
			.filter(
				({ storagePath }) =>
					(storagePath as PalletKeyInfo).module == 'system' &&
					(storagePath as PalletKeyInfo).item == 'account'
			)
			.map((e) => {
				// key = h(system) + h(account) + h(address) + address
				// Remove the storage key + account hash
				const addressRaw = e.values.string_values.key?.slice(96);

				const address = this.registry.createType(
					'Address',
					`0x${addressRaw}`
				);

				const method = e?.values?.string_values?.message;
				const accountInfoEncoded =
					method === 'clear'
						? 'no-account'
						: (e?.values?.string_values?.res as string);

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
						// const scale = accountInfoEncoded.slice(5, len - 1); // should use this with polkadot
						// HACK to work with substrate node - AccountInfo = u32 + u32 + AccountData. We slice off
						// the leading u32s and just create AccountData bc it has the wrong type for AccountInfo.
						// const scale = accountInfoEncoded.slice(5 + 16, len - 1);
						// accountInfo = (this.registry.createType(
						// 	'AccountData',
						// 	`0x${scale}`
						// ) as unknown) as AccountInfo;
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
					throw new Error(
						'Expect there to always be some AccountInfo'
					);
				}

				return { ...e, accountInfo, address };
			});
	}

	private accountEventsByAddress(): Map<string, EventWithAccountInfo[]> {
		return this.systemAccountEvents().reduce((acc, cur) => {
			const addr = cur.address.toString();
			if (!acc.has(addr)) {
				acc.set(addr, []);
			}

			acc.get(addr)?.push(cur);

			return acc;
		}, new Map<string, EventWithAccountInfo[]>());
	}

	private transitionPerAccount(): Map<string, Transition[]> {
		return [...this.accountEventsByAddress().entries()].reduce(
			(acc, [addr, events]) => {
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
						parentSpanId: e.parentSpanId,
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
			},
			new Map<string, Transition[]>()
		);
	}

	private operations(): Operation[] {
		return [...this.transitionPerAccount().values()]
			.flat()
			.sort((a, b) => a.eventIndex - b.eventIndex)
			.map((transition, idx) => {
				return {
					operationId: {
						operationIndex: idx,
						phase: {
							extrinsic: 6666,
						},
						eventIndex: transition.eventIndex,
						parentSpanId: transition.parentSpanId,
					},
					address: transition.address,
					storage: transition.storage,
					amount: transition.amount,
				};
			});
	}
}
