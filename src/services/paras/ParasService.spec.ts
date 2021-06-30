import BN from 'bn.js';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	auctionsInfoAt,
	blockHash20000,
	blockHash789629,
	emptyVectorLeases,
	mockApi,
	mockBlock789629,
	noneAuctionsInfoAt,
	slotsLeasesAt,
} from '../test-helpers/mock';
import { ParasService } from './ParasService';

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

			(mockApi.query.slots.leases.at as unknown) = emptyLeasesAt;

			const expectedResponse = {
				at: expectedAt,
				leases: null,
				paraLifecycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash789629, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(mockApi.query.slots.leases.at as unknown) = slotsLeasesAt;
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
			const leaseIndexArray =
				parasService['enumerateLeaseSets'](leasePeriodIndex);
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
			(mockApi.query.auctions.auctionInfo.at as unknown) = noneAuctionsInfoAt;

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

			(mockApi.query.auctions.auctionInfo.at as unknown) = auctionsInfoAt;
		});
	});
});
