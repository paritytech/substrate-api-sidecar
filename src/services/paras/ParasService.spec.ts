// import { AnyJson } from '@polkadot/types/types';
// import { Option } from '@polkadot/types/codec';
// import { FundInfo } from '@polkadot/types/interfaces'

import { blockHash789629, mockApi } from '../test-helpers/mock';
import { ParasService } from './ParasService';
// import { rococoRegistry } from '../../test-helpers/registries';

const parasService = new ParasService(mockApi);

describe('ParasService', () => {
	const expectedHash =
		'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578';
	const expectedHeight = '789629';

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
		it('Should return appropriate info', async () => {
			const paraId = 199;

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
		it('Should return correct response', async () => {
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

	describe('ParasService.leaseInfo', () => {});

	describe('ParasService.auctionsCurrent', () => {});

	describe('ParasService.leasesCurrent', () => {});

	describe('ParasService.paras', () => {
        it('Should return correct ParaLifecycles response', async () => {
            const { at, paras } = await parasService['paras'](
                blockHash789629
            );

            expect(at.hash.toString()).toBe(expectedHash);
            expect(at.height).toBe(expectedHeight);
            expect(paras.length).toBe(2);
            expect(paras[0]['paraId']?.toNumber()).toStrictEqual(199);
            expect(paras[1]['paraId']?.toNumber()).toStrictEqual(200);
            expect(paras[0]['onboardingAs']).toBe('parachain');
            expect(paras[1]['onboardingAs']).toBeFalsy();
            expect(paras[0]['paraLifeCycle'].toString()).toBe('Onboarding')
            expect(paras[1]['paraLifeCycle'].toString()).toBe('Parathread')
        });
    });
});
