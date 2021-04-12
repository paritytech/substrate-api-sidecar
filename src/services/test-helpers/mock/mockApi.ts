import { ApiPromise } from '@polkadot/api';
import { Tuple, Vec } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	ActiveEraInfo,
	Block,
	EraIndex,
	Extrinsic,
	Hash,
	RuntimeDispatchInfo,
	SessionIndex,
	StakingLedger,
} from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import BN from 'bn.js';

import { polkadotMetadata } from '../../../test-helpers/metadata/metadata';
import {
	polkadotRegistry,
	rococoRegistry,
} from '../../../test-helpers/registries';
import {
	createApiWithAugmentations,
	TypeFactory,
} from '../../../test-helpers/typeFactory';
import {
	balancesTransferValid,
	blockHash789629,
	mockBlock789629,
	testAddressController,
} from '.';
import { events789629 } from './data/events789629Hex';
import { localListenAddressesHex } from './data/localListenAddresses';
import { validators789629Hex } from './data/validators789629Hex';

const api = createApiWithAugmentations();
const typeFactory = new TypeFactory(api);

const eventsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<EventRecord>', events789629)
	);

const chain = () =>
	Promise.resolve().then(() => {
		return polkadotRegistry.createType('Text', 'Polkadot');
	});

export const getBlock = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock789629,
		};
	});

export const deriveGetBlock = (
	_hash: Hash
): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType(
				'AccountId',
				'1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'
			),
			block: mockBlock789629,
		};
	});

const getHeader = (_hash: Hash) =>
	Promise.resolve().then(() => mockBlock789629.header);

const runtimeVersion = {
	specName: polkadotRegistry.createType('Text', 'polkadot'),
	specVersion: polkadotRegistry.createType('u32', 16),
	transactionVersion: polkadotRegistry.createType('u32', 2),
	implVersion: polkadotRegistry.createType('u32', 0),
	implName: polkadotRegistry.createType('Text', 'parity-polkadot'),
	authoringVersion: polkadotRegistry.createType('u32', 0),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => polkadotMetadata);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType(
				'AccountId',
				'1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'
			),
		};
	});

const nextFeeMultiplierAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Fixed128', 1000000000)
	);

const validatorCountAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u32', 197));

const forceEraAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Forcing', 'NotForcing')
	);

const eraElectionStatusAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ElectionStatus', { Close: null })
	);

const validatorsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<ValidatorId>', validators789629Hex)
	);

const currentSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265876724));

const epochIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 330));

const genesisSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265084563));

const currentIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('SessionIndex', 330)
	);

const version = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Text', '0.8.22-c6ee8675-x86_64-linux-gnu')
	);

export const activeEraAt = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<ActiveEraInfo>', {
			index: 49,
			start: 1595259378000,
		})
	);

export const erasStartSessionIndexAt = (
	_hash: Hash,
	_activeEra: EraIndex
): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<SessionIndex>', 330)
	);

const unappliedSlashesAt = (_hash: Hash, _activeEra: EraIndex) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<UnappliedSlash>', [])
	);

const locksAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Vec<BalanceLock>',
			'0x047374616b696e672000e8764817000000000000000000000002'
		)
	);

const accountAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'AccountInfo',
			'0x0600000003dbb656ab7400000000000000000000000000000000000000000000000000000000e8764817000000000000000000000000e87648170000000000000000000000'
		)
	);

export const bondedAt = (
	_hash: Hash,
	_address: string
): Promise<Option<AccountId>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<AccountId>', testAddressController)
	);

const vestingAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<VestingInfo>', null)
	);

export const ledgerAt = (
	_hash: Hash,
	_address: string
): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000'
		)
	);

const payeeAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('RewardDestination', 'Controller')
	);

const slashingSpansAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() => polkadotRegistry.createType('SlashingSpans'));

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
		)
	);

export const queryInfoBalancesTransfer = (
	_extrinsic: string,
	_hash: Hash
): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('RuntimeDispatchInfo', {
			weight: 195000000,
			class: 'Normal',
			partialFee: 149000000,
		})
	);

export const submitExtrinsic = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Hash'));

const getStorage = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<Raw>', '0x')
	);

const chainType = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ChainType', {
			Live: null,
		})
	);

const properties = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ChainProperties', {
			ss58Format: '0',
			tokenDecimals: '12',
			tokenSymbol: 'DOT',
		})
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash789629);

const health = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Health', '0x7a000000000000000001')
	);

const localListenAddresses = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<Text>', localListenAddressesHex)
	);

const nodeRoles = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<NodeRole>', '0x0400')
	);

const localPeerId = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Text',
			'0x313244334b6f6f57415a66686a79717a4674796435357665424a78545969516b5872614d584c704d4d6a355a6f3471756431485a'
		)
	);

export const pendingExtrinsics = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<Extrinsic>'));

export const tx = (): Extrinsic =>
	polkadotRegistry.createType('Extrinsic', balancesTransferValid);

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistry.createType('ReferendumInfo');
	});

/**
 * ParasService specific constants
 * The below types and constants use the rococo registry in order to properly
 * test the ParasService properly accurately
 */
const funds = {
	depositor: rococoRegistry.createType(
		'AccountId',
		'14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'
	),
	verifier: null,
	deposit: rococoRegistry.createType('Balance', 100000000000000),
	raised: rococoRegistry.createType('Balance', 627500000000000),
	end: rococoRegistry.createType('BlockNumber', 200000),
	cap: rococoRegistry.createType(
		'Balance',
		'0x0000000000000000016345785d8a0000'
	),
	lastContribution: rococoRegistry.createType('LastContribution', {
		preEnding: 6,
	}),
	firstSlot: rococoRegistry.createType('LeasePeriod', 13),
	lastSlot: rococoRegistry.createType('LeasePeriod', 16),
	trieIndex: rococoRegistry.createType('TrieIndex', 60),
};

const paraLifeCycleObjectOne = {
	onboarding: true,
	parachain: true,
};
const paraLifeCycleObjectTwo = {
	parathread: true,
	parachain: false,
};
const paraId1 = typeFactory.storageKey(199);
const paraId2 = typeFactory.storageKey(200);
const paraLifecycleOne = rococoRegistry.createType(
	'ParaLifecycle',
	paraLifeCycleObjectOne
);
const paraLifecycleTwo = rococoRegistry.createType(
	'ParaLifecycle',
	paraLifeCycleObjectTwo
);
const accountIdOne = rococoRegistry.createType(
	'AccountId',
	'1TYrFCWxwHA5bhiXf6uLvPfG6eEvrzzL7uiPK3Yc6yHLUqc'
);
const accountIdTwo = rococoRegistry.createType(
	'AccountId',
	'13NXiLYYzVEjXxU3eaZNcrjEX9vPyVDNNpURCzK8Bj9BiCWH'
);
const balanceOfOne = rococoRegistry.createType('BalanceOf', 1000000);
const balanceOfTwo = rococoRegistry.createType('BalanceOf', 2000000);

const fundsEntries = () =>
	Promise.resolve().then(() => {
		const optionFundInfo = rococoRegistry.createType('Option<FundInfo>', funds);

		const entries = [
			[paraId1, optionFundInfo],
			[paraId2, optionFundInfo],
		];

		return entries;
	});

const fundsAt = () =>
	Promise.resolve().then(() => {
		return rococoRegistry.createType('Option<FundInfo>', funds);
	});

const fundsKeys = () =>
	Promise.resolve().then(() => {
		return [paraId1, paraId2];
	});

const parasLifecyclesEntriesAt = () =>
	Promise.resolve().then(() => {
		return [
			[paraId1, paraLifecycleOne],
			[paraId2, paraLifecycleTwo],
		];
	});

const parasGenesisArgsAt = () =>
	Promise.resolve().then(() => {
		return rococoRegistry.createType('ParaGenesisArgs', { parachain: true });
	});

const upcomingParasGenesisAt = () =>
	Promise.resolve().then(() => {
		return rococoRegistry.createType('Option<ParaGenesisArgs>', {
			parachain: true,
		});
	});

const parasLifecyclesAt = () =>
	Promise.resolve().then(() => {
		return typeFactory.optionOf(paraLifecycleOne);
	});

/**
 * Used for parachain leases
 */
const leasesTupleOne = typeFactory.tupleOf(
	[accountIdOne, balanceOfOne],
	['AccountId', 'BalanceOf']
);
const leasesTupleTwo = typeFactory.tupleOf(
	[accountIdTwo, balanceOfTwo],
	['AccountId', 'BalanceOf']
);
const parasOptionsOne = typeFactory.optionOf(leasesTupleOne);
const parasOptionsTwo = typeFactory.optionOf(leasesTupleTwo);
const vectorLeases = typeFactory.vecOf([parasOptionsOne, parasOptionsTwo]);

export const slotsLeasesAt = (): Promise<Vec<Option<Tuple>>> =>
	Promise.resolve().then(() => {
		return vectorLeases;
	});

const slotsLeasesEntriesAt = () =>
	Promise.resolve().then(() => {
		return [
			[paraId1, vectorLeases],
			[paraId2, vectorLeases],
		];
	});

/**
 * Used for parachain Auctions
 */
export const auctionsInfoAt = (): Promise<Option<Vec<AbstractInt>>> =>
	Promise.resolve().then(() => {
		const beingEnd = new BN(1000) as AbstractInt;
		const leasePeriodIndex = new BN(39) as AbstractInt;
		const vectorAuctions = typeFactory.vecOf([beingEnd, leasePeriodIndex]);
		const optionAuctions = typeFactory.optionOf(vectorAuctions);

		return optionAuctions;
	});

export const noneAuctionsInfoAt = (): Promise<Option<Codec>> =>
	Promise.resolve().then(() => {
		const noneOption = typeFactory.emptyOption('Null');

		return noneOption;
	});

const auctionCounterAt = () =>
	Promise.resolve().then(() => {
		const counter = new BN(4) as AbstractInt;

		return counter;
	});

const auctionsWinningsAt = () =>
	Promise.resolve().then(() => {
		const paraId1 = rococoRegistry.createType('ParaId', 199);
		const paraId2 = rococoRegistry.createType('ParaId', 200);
		const tupleOne = typeFactory.tupleOf(
			[accountIdOne, paraId1, balanceOfOne],
			['AccountId', 'ParaId', 'BalanceOf']
		);
		const tupleTwo = typeFactory.tupleOf(
			[accountIdTwo, paraId2, balanceOfTwo],
			['AccountId', 'ParaId', 'BalanceOf']
		);
		const parasOptionsOne = typeFactory.optionOf(tupleOne);
		const parasOptionsTwo = typeFactory.optionOf(tupleTwo);

		const vectorWinnings = typeFactory.vecOf([
			parasOptionsOne,
			parasOptionsTwo,
		]);
		const optionWinnings = typeFactory.optionOf(vectorWinnings);

		return optionWinnings;
	});

/**
 * Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #789629, which is what most Service unit tests are based on.
 */
export const mockApi = ({
	runtimeVersion,
	createType: polkadotRegistry.createType.bind(polkadotRegistry),
	registry: polkadotRegistry,
	tx,
	runtimeMetadata: polkadotMetadata,
	query: {
		auctions: {
			auctionInfo: {
				at: auctionsInfoAt,
			},
			auctionCounter: {
				at: auctionCounterAt,
			},
			winning: {
				at: auctionsWinningsAt,
			},
		},
		babe: {
			currentSlot: { at: currentSlotAt },
			epochIndex: { at: epochIndexAt },
			genesisSlot: { at: genesisSlotAt },
		},
		balances: {
			locks: { at: locksAt },
		},
		crowdloan: {
			funds: {
				entriesAt: fundsEntries,
				keys: fundsKeys,
				at: fundsAt,
			},
		},
		paras: {
			paraLifecycles: {
				entriesAt: parasLifecyclesEntriesAt,
				at: parasLifecyclesAt,
			},
			paraGenesisArgs: {
				at: parasGenesisArgsAt,
			},
			upcomingParasGenesis: {
				at: upcomingParasGenesisAt,
			},
		},
		session: {
			currentIndex: { at: currentIndexAt },
			validators: { at: validatorsAt },
		},
		slots: {
			leases: {
				entriesAt: slotsLeasesEntriesAt,
				at: slotsLeasesAt,
			},
		},
		staking: {
			validatorCount: { at: validatorCountAt },
			forceEra: { at: forceEraAt },
			eraElectionStatus: { at: eraElectionStatusAt },
			activeEra: { at: activeEraAt },
			erasStartSessionIndex: { at: erasStartSessionIndexAt },
			unappliedSlashes: { at: unappliedSlashesAt },
			bonded: { at: bondedAt },
			ledger: { at: ledgerAt },
			payee: { at: payeeAt },
			slashingSpans: { at: slashingSpansAt },
		},
		system: {
			events: { at: eventsAt },
			account: { at: accountAt },
		},
		transactionPayment: {
			nextFeeMultiplier: { at: nextFeeMultiplierAt },
		},
		vesting: {
			vesting: { at: vestingAt },
		},
		democracy: {
			referendumInfoOf: { at: referendumInfoOfAt },
		},
	},
	consts: {
		auctions: {
			endingPeriod: new BN(20000),
			sampleLength: new BN(2),
		},
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
		transactionPayment: {
			transactionByteFee: polkadotRegistry.createType('Balance', 1000000),
			weightToFee: [
				{
					coeffFrac: polkadotRegistry.createType('Perbill', 80000000),
					coeffInteger: polkadotRegistry.createType('Balance', 0),
					degree: polkadotRegistry.createType('u8', 1),
					negative: false,
				},
			],
		},
		slots: {
			leasePeriod: new BN(20000),
		},
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
		system: {
			extrinsicBaseWeight: polkadotRegistry.createType('u64', 125000000),
		},
	},
	rpc: {
		chain: {
			getHeader,
			getBlock,
			getBlockHash: getBlockHashGenesis,
			getFinalizedHead,
		},
		state: {
			getRuntimeVersion,
			getMetadata,
			getStorage,
		},
		system: {
			chain,
			health,
			localListenAddresses,
			nodeRoles,
			localPeerId,
			version,
			chainType,
			properties,
		},
		payment: {
			queryInfo: queryInfoBalancesTransfer,
		},
		author: {
			submitExtrinsic,
			pendingExtrinsics,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: deriveGetBlock,
		},
	},
} as unknown) as ApiPromise;
