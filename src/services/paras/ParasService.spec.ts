// import { AnyJson } from '@polkadot/types/types';
// import { Option } from '@polkadot/types/codec';
// import { FundInfo } from '@polkadot/types/interfaces'

import { blockHash789629, mockApi, slotsLeasesAt } from '../test-helpers/mock';
import { ParasService } from './ParasService';
// import { rococoRegistry } from '../../test-helpers/registries';

const parasService = new ParasService(mockApi);

describe('ParasService', () => {
	const expectedHash =
		'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578';
	const expectedHeight = '789629';
	const paraId = 199;

	const expectedFunds = {
		retiring: false,
		depositor: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
		verifier: null,
		deposit: 100000000000000,
		raised: 627500000000000,
		end: 200000,
		cap: '0x0000000000000000016345785d8a0000',
		lastContribution: { preEnding: 6 },
		firstSlot: 13,
		lastSlot: 16,
		trieIndex: 60,
	};

	describe('ParasService.crowdloansInfo', () => {
		it('Should return correct crowdloans info', async () => {
			const { at, fundInfo, leasePeriods } = await parasService[
				'crowdloansInfo'
			](blockHash789629, paraId);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(fundInfo?.toJSON()).toStrictEqual(expectedFunds);
			expect(leasePeriods).toStrictEqual([13, 14, 15, 16]);
		});
	});

	describe('ParasService.crowdloans', () => {
		it('Should return correct crowdloans response', async () => {
			const { at, funds } = await parasService['crowdloans'](
				blockHash789629,
				true
			);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(funds.length).toBe(2);
			expect(funds[0]['fundInfo']?.toJSON()).toStrictEqual(expectedFunds);
			expect(funds[1]['fundInfo']?.toJSON()).toStrictEqual(expectedFunds);
			expect(funds[0]['paraId']?.toNumber()).toStrictEqual(199);
			expect(funds[1]['paraId']?.toNumber()).toStrictEqual(200);
		});

		it('Should return a undefined fundInfo when includeFundInfo is false', async () => {
			const { at, funds } = await parasService['crowdloans'](
				blockHash789629,
				false
			);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(funds.length).toBe(2);
			expect(funds[0]['fundInfo']?.toJSON()).toStrictEqual(undefined);
			expect(funds[0]['paraId']?.toNumber()).toStrictEqual(199);
			expect(funds[1]['paraId']?.toNumber()).toStrictEqual(200);
		});
	});

	describe('ParasService.leaseInfo', () => {
		it('Should return the correct leasing information', async () => {
			const { at, paraLifeCycle, onboardingAs, leases } = await parasService[
				'leaseInfo'
			](blockHash789629, paraId);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(leases).toBeTruthy();
			expect(leases?.length).toBe(2);
			expect(paraLifeCycle.toString()).toBe('Onboarding');
			expect(onboardingAs).toBe('parachain');

			if (leases) {
				expect(leases[0].account.toString()).toBe(
					'5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N'
				);
				expect(leases[1].account.toString()).toBe(
					'5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ'
				);
				expect(leases[0].deposit.toNumber()).toBe(1000000);
				expect(leases[1].deposit.toNumber()).toBe(2000000);
				expect(leases[0].leasePeriodIndex).toBe(39);
				expect(leases[1].leasePeriodIndex).toBe(40);
			}
		});

		it('Should return a null leases when length is equal to 0', async () => {
			const emptyLeasesAt = () =>
				Promise.resolve().then(() => {
					return [];
				});

			(mockApi.query.slots.leases.at as unknown) = emptyLeasesAt;

			const { at, leases } = await parasService['leaseInfo'](
				blockHash789629,
				paraId
			);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(leases).toBeNull();

			(mockApi.query.slots.leases.at as unknown) = slotsLeasesAt;
		});
	});

	describe('ParasService.leasesCurrent', () => {
		it('Should return the correct entries for leasesCurrent', async () => {
			const {
				at,
				leasePeriodIndex,
				endOfLeasePeriod,
				currentLeaseHolders,
			} = await parasService['leasesCurrent'](blockHash789629, true);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(leasePeriodIndex.toNumber()).toBe(39);
			expect(endOfLeasePeriod.toNumber()).toBe(800000);
			if (currentLeaseHolders) {
				expect(currentLeaseHolders[0].toNumber()).toBe(199);
				expect(currentLeaseHolders[1].toNumber()).toBe(200);
			}
		});

		it('Should return the correct response exlcuding currentLeaseHolders', async () => {
			const {
				at,
				leasePeriodIndex,
				endOfLeasePeriod,
				currentLeaseHolders,
			} = await parasService['leasesCurrent'](blockHash789629, false);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(leasePeriodIndex.toNumber()).toBe(39);
			expect(endOfLeasePeriod.toNumber()).toBe(800000);
			expect(currentLeaseHolders).toBeUndefined();
		});
	});

	describe('ParasService.paras', () => {
		it('Should return correct ParaLifecycles response', async () => {
			const { at, paras } = await parasService['paras'](blockHash789629);

			expect(at.hash.toString()).toBe(expectedHash);
			expect(at.height).toBe(expectedHeight);
			expect(paras.length).toBe(2);
			expect(paras[0]['paraId']?.toNumber()).toStrictEqual(199);
			expect(paras[1]['paraId']?.toNumber()).toStrictEqual(200);
			expect(paras[0]['onboardingAs']).toBe('parachain');
			expect(paras[1]['onboardingAs']).toBeFalsy();
			expect(paras[0]['paraLifeCycle'].toString()).toBe('Onboarding');
			expect(paras[1]['paraLifeCycle'].toString()).toBe('Parathread');
		});
	});

	describe('ParasService.auctionsCurrent', () => {
		it('Should return to correct data during an ongoing auction', async () => {
			// const { at } =  await parasService['auctionsCurrent'](blockHash789629);

			// expect(at.hash.toString()).toBe(expectedHash);
			// expect(at.height).toBe(expectedHeight);
		});
	});
});
