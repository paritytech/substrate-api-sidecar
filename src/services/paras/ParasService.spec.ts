// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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
import { polkadotMetadataRpcV1000001 } from '../../test-helpers/metadata/polkadotV1000001Metadata';
import { polkadotRegistryV1000001 } from '../../test-helpers/registries';
import { createApiWithAugmentations, TypeFactory } from '../../test-helpers/typeFactory';
import { blockHash18468942, mockApiBlock18468942, mockBlock18468942 } from '../test-helpers/mock';
import { eventsHex } from '../test-helpers/mock/paras/eventsHex';
import parasHeadBackedCandidatesResponse from '../test-helpers/responses/paras/parasHeadBackedCandidates.json';
import parasHeadIncludedCandidatesResponse from '../test-helpers/responses/paras/parasHeadIncludedCandidates.json';
import { ParasService } from './ParasService';

/**
 * ParasService specific constants
 * The below types and constants use the Polkadot registry in order to properly
 * test the ParasService with accurate metadata
 */
const polkadotApi = createApiWithAugmentations(polkadotMetadataRpcV1000001);
const polkadotTypeFactory = new TypeFactory(polkadotApi);

/**
 * Used for parachain crowdloans
 */
const funds = {
	depositor: polkadotRegistryV1000001.createType('AccountId', '12rgGkphjoZ25FubPoxywaNm3oVhSHnzExnT6hsLnicuLaaj'),
	verifier: null,
	deposit: polkadotRegistryV1000001.createType('Balance', 5000000000000),
	raised: polkadotRegistryV1000001.createType('Balance', 2999970000000000),
	end: polkadotRegistryV1000001.createType('BlockNumber', 14164600),
	cap: polkadotRegistryV1000001.createType('Balance', 3000000000000000),
	lastContribution: polkadotRegistryV1000001.createType('LastContribution', {
		preEnding: 34,
	}),
	firstPeriod: polkadotRegistryV1000001.createType('LeasePeriod', 11),
	lastPeriod: polkadotRegistryV1000001.createType('LeasePeriod', 15),
	trieIndex: polkadotRegistryV1000001.createType('TrieIndex', 55),
};

const paraLifecycleObjectOne = {
	onboarding: true,
	parachain: true,
};
const paraLifecycleObjectTwo = {
	parathread: true,
	parachain: false,
};
const crowdloanParaId1 = polkadotTypeFactory.storageKey(1000, 'ParaId', polkadotApi.query.crowdloan.funds);
const crowdloanParaId2 = polkadotTypeFactory.storageKey(200, 'ParaId', polkadotApi.query.crowdloan.funds);
const paraLifecycleOne = polkadotRegistryV1000001.createType('ParaLifecycle', paraLifecycleObjectOne);
const paraLifecycleTwo = polkadotRegistryV1000001.createType('ParaLifecycle', paraLifecycleObjectTwo);
const accountIdOne = polkadotRegistryV1000001.createType(
	'AccountId',
	'13UVJyLnbVp77Z2t6qjFmcyzTXYQJjyb6Hww7ZHPumd81iht',
);
const accountIdTwo = polkadotRegistryV1000001.createType(
	'AccountId',
	'13UVJyLnbVp77Z2t6qpQs8LAavPA1FuD53ocaULGhTEy8s6n',
);
const balanceOfOne = polkadotRegistryV1000001.createType('BalanceOf', 1000000);
const balanceOfTwo = polkadotRegistryV1000001.createType('BalanceOf', 2999970000000000);

const fundsEntries = () =>
	Promise.resolve().then(() => {
		const optionFundInfo = polkadotRegistryV1000001.createType('Option<FundInfo>', funds);

		const entries = [
			[crowdloanParaId1, optionFundInfo],
			[crowdloanParaId2, optionFundInfo],
		];

		return entries;
	});

const fundsAt = () =>
	Promise.resolve().then(() => {
		return polkadotRegistryV1000001.createType('Option<FundInfo>', funds);
	});

const fundsKeys = () =>
	Promise.resolve().then(() => {
		return [crowdloanParaId1, crowdloanParaId2];
	});

/**
 * Used for parachain paras
 */
const paraLifeCycleParaId1 = polkadotTypeFactory.storageKey(199, 'ParaId', polkadotApi.query.paras.paraLifecycles);
const paraLifeCycleParaId2 = polkadotTypeFactory.storageKey(200, 'ParaId', polkadotApi.query.paras.paraLifecycles);

const parasLifecyclesEntriesAt = () =>
	Promise.resolve().then(() => {
		return [
			[paraLifeCycleParaId1, paraLifecycleOne],
			[paraLifeCycleParaId2, paraLifecycleTwo],
		];
	});

const parasGenesisArgsAt = () =>
	Promise.resolve().then(() => {
		return polkadotRegistryV1000001.createType('ParaGenesisArgs', { parachain: true });
	});

const upcomingParasGenesisAt = () =>
	Promise.resolve().then(() => {
		return polkadotRegistryV1000001.createType('Option<ParaGenesisArgs>', {
			parachain: true,
		});
	});

const parasLifecyclesAt = () =>
	Promise.resolve().then(() => {
		return polkadotTypeFactory.optionOf(paraLifecycleOne);
	});

/**
 * Used for parachain leases
 */
const leasesParaId1 = polkadotTypeFactory.storageKey(2094, 'ParaId', polkadotApi.query.slots.leases);
const leasesParaId2 = polkadotTypeFactory.storageKey(2097, 'ParaId', polkadotApi.query.slots.leases);
const leasesTupleTwo = polkadotTypeFactory.tupleOf([accountIdTwo, balanceOfTwo], ['AccountId', 'BalanceOf']);
const parasOptionsTwo = polkadotTypeFactory.optionOf(leasesTupleTwo);
const vectorLeases = polkadotTypeFactory.vecOf([parasOptionsTwo]);
export const emptyVectorLeases = polkadotRegistryV1000001.createType('Vec<Raw>', []);

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
		const beginEnd = polkadotRegistryV1000001.createType('BlockNumber', 18001400);
		const leasePeriodIndex = polkadotRegistryV1000001.createType('BlockNumber', 15);
		const vectorAuctions = polkadotTypeFactory.vecOf([leasePeriodIndex, beginEnd]);
		const optionAuctions = polkadotTypeFactory.optionOf(vectorAuctions);

		return optionAuctions;
	});

export const noneAuctionsInfoAt = (): Promise<Option<Codec>> =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Option<Raw>', null));

const auctionCounterAt = () =>
	Promise.resolve().then(() => {
		const counter = new BN(4) as AbstractInt;

		return counter;
	});

const auctionsWinningsAt = () =>
	Promise.resolve().then(() => {
		const paraId1 = polkadotRegistryV1000001.createType('ParaId', 1000);
		const paraId2 = polkadotRegistryV1000001.createType('ParaId', 200);
		const tupleOne = polkadotTypeFactory.tupleOf(
			[accountIdOne, paraId1, balanceOfOne],
			['AccountId', 'ParaId', 'BalanceOf'],
		);
		const tupleTwo = polkadotTypeFactory.tupleOf(
			[accountIdTwo, paraId2, balanceOfTwo],
			['AccountId', 'ParaId', 'BalanceOf'],
		);
		const parasOptionsOne = polkadotTypeFactory.optionOf(tupleOne);
		const parasOptionsTwo = polkadotTypeFactory.optionOf(tupleTwo);

		// No bids for the remaining slot ranges
		const mockWinningOptions = new Array(8).fill(
			polkadotRegistryV1000001.createType('Option<Raw>', null), // This is just `Option::None`
		) as Option<Tuple>[];

		// Total of 10 winning object, 2 `Some(..)`, 8 `None`
		const vectorWinnings = polkadotTypeFactory.vecOf([parasOptionsOne, parasOptionsTwo, ...mockWinningOptions]);
		const optionWinnings = polkadotTypeFactory.optionOf(vectorWinnings);

		return optionWinnings;
	});

/**
 * Used for parachain ParasHeads
 */
const eventsAt = () =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Vec<FrameSystemEventRecord>', eventsHex));

const historicApi = {
	consts: {
		auctions: {
			endingPeriod: new BN(53400),
			sampleLength: new BN(2),
			leasePeriodsPerSlot: new BN(8),
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
	...mockApiBlock18468942,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const parasService = new ParasService(mockApi);

describe('ParasService', () => {
	const paraId = 2094;

	const expectedAt = {
		hash: '0x1ffece02b91e52c4923827843774f705911905c0a66980f7037bed643b746d1d',
		height: '18468942',
	};

	const expectedFund = {
		depositor: '12rgGkphjoZ25FubPoxywaNm3oVhSHnzExnT6hsLnicuLaaj',
		verifier: null,
		deposit: '5000000000000',
		raised: '2999970000000000',
		end: '14164600',
		cap: '3000000000000000',
		lastContribution: { preEnding: '34' },
		firstPeriod: '11',
		lastPeriod: '15',
		trieIndex: '55',
	};

	describe('ParasService.crowdloansInfo', () => {
		it('Should return correct crowdloans info for a queried `paraId`', async () => {
			const expectedResponse = {
				at: expectedAt,
				fundInfo: expectedFund,
				leasePeriods: ['11', '12', '13', '14', '15'],
			};

			const response = await parasService.crowdloansInfo(blockHash18468942, paraId);

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
						paraId: '1000',
					},
					{
						fundInfo: expectedFund,
						paraId: '200',
					},
				],
			};

			const response = await parasService.crowdloans(blockHash18468942);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.leaseInfo', () => {
		it('Should return the correct leasing information for a queried `paraId`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leases: [
					{
						account: '13UVJyLnbVp77Z2t6qpQs8LAavPA1FuD53ocaULGhTEy8s6n',
						deposit: '2999970000000000',
					},
				],
				paraLifecycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash18468942, paraId);

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

			const response = await parasService.leaseInfo(blockHash18468942, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(historicApi.query.slots.leases as unknown) = slotsLeasesAt;
		});
	});

	describe('ParasService.leasesCurrent', () => {
		it('Should return the correct entries for `leasesCurrent`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leasePeriodIndex: '923',
				endOfLeasePeriod: '18480000',
				currentLeaseHolders: ['2094', '2097'],
			};

			const response = await parasService.leasesCurrent(blockHash18468942, true);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct response excluding `currentLeaseHolders`', async () => {
			const expectedResponse = {
				at: expectedAt,
				leasePeriodIndex: '923',
				endOfLeasePeriod: '18480000',
				currentLeaseHolders: undefined,
			};

			const response = await parasService.leasesCurrent(blockHash18468942, false);

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

			const response = await parasService.paras(blockHash18468942);

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
				parentHash: '0xa59330a7420132ea9429939ab5e5b695c5100985af507c6feb29a6fcacfb572e',
				number: blockNumber,
				stateRoot: '0x6ad2141fb995ec4076449fc512169e033747a90adfbd1d2120aed1addf534d58',
				extrinsicsRoot: '0xc58ba0e38feed447870398e0f45cd234e00dc4cd40200b1248e341ab9ea058e2',
				digest: {},
			};
		};

		it('Should return the correct data during an ongoing endPeriod phase', async () => {
			const expectedResponse = {
				at: expectedAt,
				beginEnd: '18001400',
				finishEnd: '18054800',
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash18468942);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct data during a startPeriod phase', async () => {
			const overrideHeader = generateOverrideHeader(770000);
			const header = polkadotRegistryV1000001.createType('Header', overrideHeader);

			// Override the mockApi
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => header);

			const expectedResponse = {
				at: {
					hash: '0x1ffece02b91e52c4923827843774f705911905c0a66980f7037bed643b746d1d',
					height: '770000',
				},
				beginEnd: '18001400',
				finishEnd: '18054800',
				phase: 'startPeriod',
				auctionIndex: '4',
				leasePeriods: ['15', '16', '17', '18', '19', '20', '21', '22'],
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash18468942);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);

			// Set the MockApi back to its original self
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => mockBlock18468942.header);
		});

		it('Should return the correct data during a vrfDelay phase', async () => {
			const overrideHeader = generateOverrideHeader(18468942);
			const header = polkadotRegistryV1000001.createType('Header', overrideHeader);

			// Override the mockApi
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => header);

			const expectedResponse = {
				at: {
					hash: '0x1ffece02b91e52c4923827843774f705911905c0a66980f7037bed643b746d1d',
					height: '18468942',
				},
				beginEnd: '18001400',
				finishEnd: '18054800',
				phase: 'vrfDelay',
				auctionIndex: '4',
				leasePeriods: ['15', '16', '17', '18', '19', '20', '21', '22'],
				winning: null,
			};

			const response = await parasService.auctionsCurrent(blockHash18468942);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);

			// Set the MockApi back to its original self
			(mockApi.rpc.chain.getHeader as unknown) = () => Promise.resolve().then(() => mockBlock18468942.header);
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

			const response = await parasService.auctionsCurrent(blockHash18468942);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(historicApi.query.auctions.auctionInfo as unknown) = auctionsInfoAt;
		});
	});
	describe('ParasService.parasHead', () => {
		it('Should return the correct response for CandidateIncluded methods', async () => {
			const response = await parasService.parasHead(blockHash18468942, 'CandidateIncluded');

			expect(sanitizeNumbers(response)).toStrictEqual(parasHeadIncludedCandidatesResponse);
		});

		it('Should return the correct response for CandidateBacked methods', async () => {
			const response = await parasService.parasHead(blockHash18468942, 'CandidateBacked');

			expect(sanitizeNumbers(response)).toStrictEqual(parasHeadBackedCandidatesResponse);
		});
	});
});
