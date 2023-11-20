// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Option, Tuple, Vec } from '@polkadot/types';
import { BlockNumber, Hash } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import { AbstractInt } from '@polkadot/types-codec';
import BN from 'bn.js';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { rococoMetadataV228 } from '../../test-helpers/metadata/rococoMetadata';
import { polkadotRegistry, polkadotRegistryV9300, rococoRegistry } from '../../test-helpers/registries';
import { createApiWithAugmentations, TypeFactory } from '../../test-helpers/typeFactory';
import { blockHash789629, defaultMockApi, mockBlock789629 } from '../test-helpers/mock';
import { eventsHex } from '../test-helpers/mock/paras/eventsHex';
import parasHeadBackedCandidatesResponse from '../test-helpers/responses/paras/parasHeadBackedCandidates.json';
import parasHeadIncludedCandidatesResponse from '../test-helpers/responses/paras/parasHeadIncludedCandidates.json';
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
	depositor: rococoRegistry.createType('AccountId', '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'),
	verifier: null,
	deposit: rococoRegistry.createType('Balance', 100000000000000),
	raised: rococoRegistry.createType('Balance', 627500000000000),
	end: rococoRegistry.createType('BlockNumber', 200000),
	cap: rococoRegistry.createType('Balance', '0x0000000000000000016345785d8a0000'),
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
const crowdloanParaId1 = rococoTypeFactory.storageKey(199, 'ParaId', rococoApi.query.crowdloan.funds);
const crowdloanParaId2 = rococoTypeFactory.storageKey(200, 'ParaId', rococoApi.query.crowdloan.funds);
const paraLifecycleOne = rococoRegistry.createType('ParaLifecycle', paraLifecycleObjectOne);
const paraLifecycleTwo = rococoRegistry.createType('ParaLifecycle', paraLifecycleObjectTwo);
const accountIdOne = rococoRegistry.createType('AccountId', '1TYrFCWxwHA5bhiXf6uLvPfG6eEvrzzL7uiPK3Yc6yHLUqc');
const accountIdTwo = rococoRegistry.createType('AccountId', '13NXiLYYzVEjXxU3eaZNcrjEX9vPyVDNNpURCzK8Bj9BiCWH');
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
const paraLifeCycleParaId1 = rococoTypeFactory.storageKey(199, 'ParaId', rococoApi.query.paras.paraLifecycles);
const paraLifeCycleParaId2 = rococoTypeFactory.storageKey(200, 'ParaId', rococoApi.query.paras.paraLifecycles);

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
const leasesParaId1 = rococoTypeFactory.storageKey(199, 'ParaId', rococoApi.query.slots.leases);
const leasesParaId2 = rococoTypeFactory.storageKey(200, 'ParaId', rococoApi.query.slots.leases);
const leasesTupleOne = rococoTypeFactory.tupleOf([accountIdOne, balanceOfOne], ['AccountId', 'BalanceOf']);
const leasesTupleTwo = rococoTypeFactory.tupleOf([accountIdTwo, balanceOfTwo], ['AccountId', 'BalanceOf']);
const parasOptionsOne = rococoTypeFactory.optionOf(leasesTupleOne);
const parasOptionsTwo = rococoTypeFactory.optionOf(leasesTupleTwo);
const vectorLeases = rococoTypeFactory.vecOf([parasOptionsOne, parasOptionsTwo]);
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
		const beginEnd = rococoRegistry.createType('BlockNumber', 780000);
		const leasePeriodIndex = rococoRegistry.createType('BlockNumber', 39);
		const vectorAuctions = rococoTypeFactory.vecOf([leasePeriodIndex, beginEnd]);
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
			['AccountId', 'ParaId', 'BalanceOf'],
		);
		const tupleTwo = rococoTypeFactory.tupleOf(
			[accountIdTwo, paraId2, balanceOfTwo],
			['AccountId', 'ParaId', 'BalanceOf'],
		);
		const parasOptionsOne = rococoTypeFactory.optionOf(tupleOne);
		const parasOptionsTwo = rococoTypeFactory.optionOf(tupleTwo);

		// No bids for the remaining slot ranges
		const mockWinningOptions = new Array(8).fill(
			rococoRegistry.createType('Option<Raw>', null), // This is just `Option::None`
		) as Option<Tuple>[];

		// Total of 10 winning object, 2 `Some(..)`, 8 `None`
		const vectorWinnings = rococoTypeFactory.vecOf([parasOptionsOne, parasOptionsTwo, ...mockWinningOptions]);
		const optionWinnings = rococoTypeFactory.optionOf(vectorWinnings);

		return optionWinnings;
	});

/**
 * Used for parachain ParasHeads
 */
const eventsAt = () =>
	Promise.resolve().then(() => polkadotRegistryV9300.createType('Vec<FrameSystemEventRecord>', eventsHex));

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
		system: {
			events: eventsAt,
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

			const response = await parasService.crowdloansInfo(blockHash789629, paraId);

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
			const emptyLeasesAt = () => Promise.resolve().then(() => emptyVectorLeases);

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
		/**
		 * Helper function to generate a a header to use to override the current one.
		 * This allows us to change the expected block we are using here as our head
		 * to test for a specific `phase` in an auction.
		 *
		 * @param blockNumber Current block head returned by header
		 * @returns
		 */
		const generateOverrideHeader = (blockNumber: number): Record<string, unknown> => {
			return {
				parentHash: '0x205da5dba43bbecae52b44912249480aa9f751630872b6b6ba1a9d2aeabf0177',
				number: blockNumber,
				stateRoot: '0x023b5bb1bc10a1a91a9ef683f46a8bb09666c50476d5592bd6575a73777eb173',
				extrinsicsRoot: '0x4c1d65bf6b57086f00d5df40aa0686ffbc581ef60878645613b1fc3303de5030',
				digest: {},
			};
		};

		it('Should return the correct data during an ongoing endPeriod phase', async () => {
			const leasePeriodIndex = new BN(39);
			const leaseIndexArray = parasService['enumerateLeaseSets'](historicApi, leasePeriodIndex);
			// Remove the first two entries with splice because we have them in the expectedResponse.
			// `LEASE_PERIODS_PER_SLOT_FALLBACK` is 4 we need 10 slots for winning.
			const additionalWinningOptions = leaseIndexArray.splice(2, leaseIndexArray.length - 2).map((k) => {
				return { bid: null, leaseSet: sanitizeNumbers(k) };
			});

			const expectedResponse = {
				at: expectedAt,
				beginEnd: '780000',
				finishEnd: '800000',
				phase: 'endPeriod',
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

		it('Should return the correct data during a startPeriod phase', async () => {
			const overrideHeader = generateOverrideHeader(770000);
			const header = polkadotRegistry.createType('Header', overrideHeader);

			// Override the mockApi
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => header);

			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '770000',
				},
				beginEnd: '780000',
				finishEnd: '800000',
				phase: 'startPeriod',
				auctionIndex: '4',
				leasePeriods: ['39', '40', '41', '42'],
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash789629);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);

			// Set the MockApi back to its original self
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => mockBlock789629.header);
		});

		it('Should return the correct data during a vrfDelay phase', async () => {
			const overrideHeader = generateOverrideHeader(800000);
			const header = polkadotRegistry.createType('Header', overrideHeader);

			// Override the mockApi
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => header);

			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '800000',
				},
				beginEnd: '780000',
				finishEnd: '800000',
				phase: 'vrfDelay',
				auctionIndex: '4',
				leasePeriods: ['39', '40', '41', '42'],
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash789629);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);

			// Set the MockApi back to its original self
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => mockBlock789629.header);
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
	describe('ParasService.parasHead', () => {
		it('Should return the correct response for CandidateIncluded methods', async () => {
			const response = await parasService.parasHead(blockHash789629, 'CandidateIncluded');

			expect(sanitizeNumbers(response)).toStrictEqual(parasHeadIncludedCandidatesResponse);
		});

		it('Should return the correct response for CandidateBacked methods', async () => {
			const response = await parasService.parasHead(blockHash789629, 'CandidateBacked');

			expect(sanitizeNumbers(response)).toStrictEqual(parasHeadBackedCandidatesResponse);
		});
	});
});
