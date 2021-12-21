import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Option, Tuple, Vec } from '@polkadot/types';
import { BlockNumber, Hash } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import { AbstractInt } from '@polkadot/types-codec';
import BN from 'bn.js';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { rococoMetadataV228 } from '../../test-helpers/metadata/rococoMetadata';
import {
	polkadotRegistry,
	rococoRegistry,
} from '../../test-helpers/registries';
import {
	createApiWithAugmentations,
	TypeFactory,
} from '../../test-helpers/typeFactory';
import {
	blockHash20000,
	blockHash789629,
	defaultMockApi,
	mockBlock789629,
} from '../test-helpers/mock';
import { ParasService } from './ParasService';

/**
 * ParasService specific constants
 * The below types and constants use the rococo registry in order to properly
 * test the ParasService with accurate metadata
 */
const rococoApi = createApiWithAugmentations(rococoMetadataV228);
const rococoTypeFactory = new TypeFactory(rococoApi);

/**
 * Used for parachain crowdloans
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
	firstPeriod: rococoRegistry.createType('LeasePeriod', 13),
	lastPeriod: rococoRegistry.createType('LeasePeriod', 16),
	trieIndex: rococoRegistry.createType('TrieIndex', 60),
};

const paraLifecycleObjectOne = {
	onboarding: true,
	parachain: true,
};
const paraLifecycleObjectTwo = {
	parathread: true,
	parachain: false,
};
const crowdloanParaId1 = rococoTypeFactory.storageKey(
	199,
	'ParaId',
	rococoApi.query.crowdloan.funds
);
const crowdloanParaId2 = rococoTypeFactory.storageKey(
	200,
	'ParaId',
	rococoApi.query.crowdloan.funds
);
const paraLifecycleOne = rococoRegistry.createType(
	'ParaLifecycle',
	paraLifecycleObjectOne
);
const paraLifecycleTwo = rococoRegistry.createType(
	'ParaLifecycle',
	paraLifecycleObjectTwo
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
			[crowdloanParaId1, optionFundInfo],
			[crowdloanParaId2, optionFundInfo],
		];

		return entries;
	});

const fundsAt = () =>
	Promise.resolve().then(() => {
		return rococoRegistry.createType('Option<FundInfo>', funds);
	});

const fundsKeys = () =>
	Promise.resolve().then(() => {
		return [crowdloanParaId1, crowdloanParaId2];
	});

/**
 * Used for parachain paras
 */
const paraLifeCycleParaId1 = rococoTypeFactory.storageKey(
	199,
	'ParaId',
	rococoApi.query.paras.paraLifecycles
);
const paraLifeCycleParaId2 = rococoTypeFactory.storageKey(
	200,
	'ParaId',
	rococoApi.query.paras.paraLifecycles
);

const parasLifecyclesEntriesAt = () =>
	Promise.resolve().then(() => {
		return [
			[paraLifeCycleParaId1, paraLifecycleOne],
			[paraLifeCycleParaId2, paraLifecycleTwo],
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
		return rococoTypeFactory.optionOf(paraLifecycleOne);
	});

/**
 * Used for parachain leases
 */
const leasesParaId1 = rococoTypeFactory.storageKey(
	199,
	'ParaId',
	rococoApi.query.slots.leases
);
const leasesParaId2 = rococoTypeFactory.storageKey(
	200,
	'ParaId',
	rococoApi.query.slots.leases
);
const leasesTupleOne = rococoTypeFactory.tupleOf(
	[accountIdOne, balanceOfOne],
	['AccountId', 'BalanceOf']
);
const leasesTupleTwo = rococoTypeFactory.tupleOf(
	[accountIdTwo, balanceOfTwo],
	['AccountId', 'BalanceOf']
);
const parasOptionsOne = rococoTypeFactory.optionOf(leasesTupleOne);
const parasOptionsTwo = rococoTypeFactory.optionOf(leasesTupleTwo);
const vectorLeases = rococoTypeFactory.vecOf([
	parasOptionsOne,
	parasOptionsTwo,
]);
export const emptyVectorLeases = rococoRegistry.createType('Vec<Raw>', []);

export const slotsLeasesAt = (): Promise<Vec<Option<Tuple>>> =>
	Promise.resolve().then(() => {
		return vectorLeases;
	});

const slotsLeasesEntriesAt = () =>
	Promise.resolve().then(() => {
		return [
			[leasesParaId1, vectorLeases],
			[leasesParaId2, vectorLeases],
		];
	});

/**
 * Used for parachain Auctions
 */
export const auctionsInfoAt = (): Promise<Option<Vec<BlockNumber>>> =>
	Promise.resolve().then(() => {
		const beingEnd = rococoRegistry.createType('BlockNumber', 1000);
		const leasePeriodIndex = rococoRegistry.createType('BlockNumber', 39);
		const vectorAuctions = rococoTypeFactory.vecOf([
			leasePeriodIndex,
			beingEnd,
		]);
		const optionAuctions = rococoTypeFactory.optionOf(vectorAuctions);

		return optionAuctions;
	});

export const noneAuctionsInfoAt = (): Promise<Option<Codec>> =>
	Promise.resolve().then(() => rococoRegistry.createType('Option<Raw>', null));

const auctionCounterAt = () =>
	Promise.resolve().then(() => {
		const counter = new BN(4) as AbstractInt;

		return counter;
	});

const auctionsWinningsAt = () =>
	Promise.resolve().then(() => {
		const paraId1 = rococoRegistry.createType('ParaId', 199);
		const paraId2 = rococoRegistry.createType('ParaId', 200);
		const tupleOne = rococoTypeFactory.tupleOf(
			[accountIdOne, paraId1, balanceOfOne],
			['AccountId', 'ParaId', 'BalanceOf']
		);
		const tupleTwo = rococoTypeFactory.tupleOf(
			[accountIdTwo, paraId2, balanceOfTwo],
			['AccountId', 'ParaId', 'BalanceOf']
		);
		const parasOptionsOne = rococoTypeFactory.optionOf(tupleOne);
		const parasOptionsTwo = rococoTypeFactory.optionOf(tupleTwo);

		// No bids for the remaining slot ranges
		const mockWinningOptions = new Array(8).fill(
			rococoRegistry.createType('Option<Raw>', null) // This is just `Option::None`
		) as Option<Tuple>[];

		// Total of 10 winning object, 2 `Some(..)`, 8 `None`
		const vectorWinnings = rococoTypeFactory.vecOf([
			parasOptionsOne,
			parasOptionsTwo,
			...mockWinningOptions,
		]);
		const optionWinnings = rococoTypeFactory.optionOf(vectorWinnings);

		return optionWinnings;
	});

const historicApi = {
	consts: {
		auctions: {
			endingPeriod: new BN(20000),
			sampleLength: new BN(2),
			leasePeriodsPerSlot: undefined,
		},
		slots: {
			leasePeriod: new BN(20000),
		},
	},
	query: {
		auctions: {
			auctionInfo: auctionsInfoAt,
			auctionCounter: auctionCounterAt,
			winning: auctionsWinningsAt,
		},
		crowdloan: {
			funds: fundsAt,
		},
		paras: {
			paraLifecycles: parasLifecyclesAt,
			paraGenesisArgs: parasGenesisArgsAt,
			upcomingParasGenesis: upcomingParasGenesisAt,
		},
		slots: {
			leases: slotsLeasesAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

/**
 * Assign necessary keys to crowdloan.funds
 */
Object.assign(historicApi.query.crowdloan.funds, {
	entries: fundsEntries,
	keys: fundsKeys,
});

/**
 * Assign necessary keys to paras.paraLifecycles
 */
Object.assign(historicApi.query.paras.paraLifecycles, {
	entries: parasLifecyclesEntriesAt,
});

/**
 * Assign necessary keys to slots.leases
 */
Object.assign(historicApi.query.slots.leases, {
	entries: slotsLeasesEntriesAt,
});

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const parasService = new ParasService(mockApi);

describe('ParasService', () => {
	const paraId = 199;

	const expectedAt = {
		hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
		height: '789629',
	};

	const expectedFund = {
		depositor: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
		verifier: null,
		deposit: '100000000000000',
		raised: '627500000000000',
		end: '200000',
		cap: '100000000000000000',
		lastContribution: { preEnding: '6' },
		firstPeriod: '13',
		lastPeriod: '16',
		trieIndex: '60',
	};

	describe('ParasService.crowdloansInfo', () => {
		it('Should return correct crowdloans info for a queried `paraId`', async () => {
			const expectedResponse = {
				at: expectedAt,
				fundInfo: expectedFund,
				leasePeriods: ['13', '14', '15', '16'],
			};

			const response = await parasService.crowdloansInfo(
				blockHash789629,
				paraId
			);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.crowdloans', () => {
		it('Should return correct crowdloans response', async () => {
			const expectedResponse = {
				at: expectedAt,
				funds: [
					{
						fundInfo: expectedFund,
						paraId: '199',
					},
					{
						fundInfo: expectedFund,
						paraId: '200',
					},
				],
			};

			const response = await parasService.crowdloans(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.leaseInfo', () => {
		it('Should return the correct leasing information for a queried `paraId`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leases: [
					{
						account: '5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N',
						deposit: '1000000',
					},
					{
						account: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
						deposit: '2000000',
					},
				],
				paraLifecycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash789629, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should have `null` `leases` when its length is equal to 0', async () => {
			const emptyLeasesAt = () =>
				Promise.resolve().then(() => emptyVectorLeases);

			(historicApi.query.slots.leases as unknown) = emptyLeasesAt;

			const expectedResponse = {
				at: expectedAt,
				leases: null,
				paraLifecycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash789629, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(historicApi.query.slots.leases as unknown) = slotsLeasesAt;
		});
	});

	describe('ParasService.leasesCurrent', () => {
		it('Should return the correct entries for `leasesCurrent`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leasePeriodIndex: '39',
				endOfLeasePeriod: '800000',
				currentLeaseHolders: ['199', '200'],
			};

			const response = await parasService.leasesCurrent(blockHash789629, true);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct response excluding `currentLeaseHolders`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leasePeriodIndex: '39',
				endOfLeasePeriod: '800000',
				currentLeaseHolders: undefined,
			};

			const response = await parasService.leasesCurrent(blockHash789629, false);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.paras', () => {
		it('Should return correct ParaLifecycles response', async () => {
			const expectedResponse = {
				at: expectedAt,
				paras: [
					{
						paraId: '199',
						paraLifecycle: 'Onboarding',
						onboardingAs: 'parachain',
					},
					{
						paraId: '200',
						paraLifecycle: 'Parathread',
					},
				],
			};

			const response = await parasService.paras(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.auctionsCurrent', () => {
		it('Should return the correct data during an ongoing auction', async () => {
			const leasePeriodIndex = new BN(39);
			const leaseIndexArray = parasService['enumerateLeaseSets'](
				historicApi,
				leasePeriodIndex
			);
			// Remove the first two entries with splice because we have them in the expectedResponse.
			// `LEASE_PERIODS_PER_SLOT_FALLBACK` is 4 we need 10 slots for winning.
			const additionalWinningOptions = leaseIndexArray
				.splice(2, leaseIndexArray.length - 2)
				.map((k) => {
					return { bid: null, leaseSet: sanitizeNumbers(k) };
				});

			const expectedResponse = {
				at: expectedAt,
				beginEnd: '1000',
				finishEnd: '21000',
				phase: 'vrfDelay',
				auctionIndex: '4',
				leasePeriods: ['39', '40', '41', '42'],
				winning: [
					{
						bid: {
							accountId: '5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N',
							amount: '1000000',
							paraId: '199',
						},
						leaseSet: ['39'],
					},
					{
						bid: {
							accountId: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
							amount: '2000000',
							paraId: '200',
						},
						leaseSet: ['39', '40'],
					},
					...additionalWinningOptions,
				],
			};

			const response = await parasService.auctionsCurrent(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		/**
		 * The goal of this test is to manipulate the number of the finalized block so that it is less than
		 * the expected `finishHead`, but higher the `beginEnd` which would denote we are in the `endPeriod` phase
		 * of the current auction.
		 */
		it('Should return the correct `ending` phase', async () => {
			const overrideHeader = {
				parentHash:
					'0x3d489d71f8fd2e15259df5059a1497436e6b73497500a303b1a705993e25cb27',
				number: 20000,
				stateRoot:
					'0xa0089595e48850a8a00081dd987a4735d0e8f94ac98af89030521f23f6cb8e31',
				extrinsicsRoot:
					'0x2d5d3fdb96b487d480b08b64ed69a65433c1713ae3579dd23704cb790aa3b2ae',
				digest: {},
			};
			const header = polkadotRegistry.createType('Header', overrideHeader);

			// Override the mockApi
			(mockApi.rpc.chain.getHeader as unknown) = () =>
				Promise.resolve().then(() => header);

			const expectedResponse = 'endPeriod';

			const response = await parasService.auctionsCurrent(blockHash20000);

			expect(response.phase).toBe(expectedResponse);

			// Set the MockApi back to its original self
			(mockApi.rpc.chain.getHeader as unknown) = () =>
				Promise.resolve().then(() => mockBlock789629.header);
		});

		it('Should return the correct null values when `auctionInfo` is `None`', async () => {
			(historicApi.query.auctions.auctionInfo as unknown) = noneAuctionsInfoAt;

			const expectedResponse = {
				at: expectedAt,
				beginEnd: null,
				finishEnd: null,
				phase: null,
				auctionIndex: '4',
				leasePeriods: null,
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(historicApi.query.auctions.auctionInfo as unknown) = auctionsInfoAt;
		});
	});
});
