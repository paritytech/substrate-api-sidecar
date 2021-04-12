import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import {
	auctionsInfoAt,
	blockHash789629,
	mockApi,
	nullAuctionsInfoAt,
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
		firstSlot: '13',
		lastSlot: '16',
		trieIndex: '60',
	};

	describe('ParasService.crowdloansInfo', () => {
		it('Should return correct crowdloans info', async () => {
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

			const response = await parasService.crowdloans(blockHash789629, true);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return a undefined fundInfo when includeFundInfo is false', async () => {
			const expectedResponse = {
				at: expectedAt,
				funds: [
					{
						paraId: '199',
					},
					{
						paraId: '200',
					},
				],
			};

			const response = await parasService.crowdloans(blockHash789629, false);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.leaseInfo', () => {
		it('Should return the correct leasing information', async () => {
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
				paraLifeCycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash789629, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return a null leases when length is equal to 0', async () => {
			const emptyLeasesAt = () => Promise.resolve().then(() => []);

			(mockApi.query.slots.leases.at as unknown) = emptyLeasesAt;

			const expectedResponse = {
				at: expectedAt,
				leases: null,
				paraLifeCycle: 'Onboarding',
				onboardingAs: 'parachain',
			};

			const response = await parasService.leaseInfo(blockHash789629, paraId);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);

			(mockApi.query.slots.leases.at as unknown) = slotsLeasesAt;
		});
	});

	describe('ParasService.leasesCurrent', () => {
		it('Should return the correct entries for leasesCurrent', async () => {
			const expectedResponse = {
				at: expectedAt,
				leasePeriodIndex: '39',
				endOfLeasePeriod: '800000',
				currentLeaseHolders: ['199', '200'],
			};

			const response = await parasService.leasesCurrent(blockHash789629, true);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct response exlcuding currentLeaseHolders', async () => {
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
						paraLifeCycle: 'Onboarding',
						onboardingAs: 'parachain',
					},
					{
						paraId: '200',
						paraLifeCycle: 'Parathread',
					},
				],
			};

			const response = await parasService.paras(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});
	});

	describe('ParasService.auctionsCurrent', () => {
		it('Should return to correct data during an ongoing auction', async () => {
			const expectedResponse = {
				at: expectedAt,
				beginEnd: '39',
				finishEnd: '20039',
				phase: 'ending',
				auctionIndex: '4',
				leasePeriods: ['1000', '1001', '1002', '1003'],
				winning: [
					{
						bid: {
							accountId: '5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N',
							amount: '1000000',
							paraId: '199',
						},
						leaseSet: ['1000'],
					},
					{
						bid: {
							accountId: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
							amount: '2000000',
							paraId: '200',
						},
						leaseSet: ['1000', '1001'],
					},
				],
			};

			const response = await parasService.auctionsCurrent(blockHash789629);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct null values when auctionInfo is not of type Option', async () => {
			(mockApi.query.auctions.auctionInfo.at as unknown) = nullAuctionsInfoAt;

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
