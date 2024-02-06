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

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import type { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize';
import { polkadotRegistryV1000001 } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import {
	bondedAt,
	deriveEraExposureParam,
	ERA,
	erasRewardPointsAt,
	erasStakersClippedAt,
	erasValidatorPrefsAt,
	erasValidatorRewardAt,
	ledgerAt,
} from '../test-helpers/mock/accounts';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

const eraIndex = polkadotRegistryV1000001.createType('EraIndex', ERA);
const historyDepthAt = polkadotRegistryV1000001.createType('u32', 84);

const blockHash = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0xfb8e0fd1366f4b9b3a79864299d7f70a83f44d48cbf9ac135f2d92d9680806a8',
);
const validator = '16Divajwsc8nq8NLQUfVyDjbG18xp6GrAS4GSDVBTwm6eY27';
const nominator = '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK';
const mockHistoricApi = {
	registry: polkadotRegistryV1000001,
	consts: {
		staking: {
			historyDepth: historyDepthAt,
		},
	},
	query: {
		staking: {
			ledger: ledgerAt,
			erasRewardPoints: erasRewardPointsAt,
			erasValidatorReward: erasValidatorRewardAt,
			erasValidatorPrefs: erasValidatorPrefsAt,
			bonded: bondedAt,
			erasStakersClipped: {
				entries: erasStakersClippedAt,
			},
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const stakingPayoutsService = new AccountsStakingPayoutsService(mockApi);

describe('AccountsStakingPayoutsService', () => {
	describe('fetchAccountStakingPayout', () => {
		it('Should work with a validator address', async () => {
			const res = await stakingPayoutsService.fetchAccountStakingPayout(
				blockHash,
				validator,
				1,
				ERA,
				false,
				ERA + 1,
				mockHistoricApi,
			);

			expect(sanitizeNumbers(res)).toStrictEqual({
				at: {
					height: '789629',
					hash: '0xfb8e0fd1366f4b9b3a79864299d7f70a83f44d48cbf9ac135f2d92d9680806a8',
				},
				erasPayouts: [
					{
						era: '1039',
						payouts: [
							{
								claimed: true,
								nominatorExposure: '0',
								nominatorStakingPayout: '1043968334900993560134832959396203124',
								totalValidatorExposure: '17302617747768368',
								totalValidatorRewardPoints: '78920',
								validatorCommission: '1000000000',
								validatorId: '16Divajwsc8nq8NLQUfVyDjbG18xp6GrAS4GSDVBTwm6eY27',
							},
						],
						totalEraPayout: '308747987428782798114933729373649371136',
						totalEraRewardPoints: '23340160',
					},
				],
			});
		});
		it('Should work with a nominator address', async () => {
			const res = await stakingPayoutsService.fetchAccountStakingPayout(
				blockHash,
				nominator,
				1,
				ERA,
				false,
				ERA + 1,
				mockHistoricApi,
			);

			expect(sanitizeNumbers(res)).toStrictEqual({
				at: {
					height: '789629',
					hash: '0xfb8e0fd1366f4b9b3a79864299d7f70a83f44d48cbf9ac135f2d92d9680806a8',
				},
				erasPayouts: [
					{
						era: '1039',
						payouts: [
							{
								claimed: true,
								nominatorExposure: '21133134966048676',
								nominatorStakingPayout: '0',
								totalValidatorExposure: '21133134966048676',
								totalValidatorRewardPoints: '97620',
								validatorCommission: '1000000000',
								validatorId: '16hzCDgyqnm1tskDccVWqxDVXYDLgdrrpC4Guxu3gPgLe5ib',
							},
						],
						totalEraPayout: '308747987428782798114933729373649371136',
						totalEraRewardPoints: '23340160',
					},
				],
			});
		});
		it('Should throw an error when the depth is greater than the historyDepth', () => {
			const serviceCall = async () => {
				await stakingPayoutsService.fetchAccountStakingPayout(
					blockHash,
					nominator,
					85,
					ERA,
					true,
					ERA + 1,
					mockHistoricApi,
				);
			};
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(serviceCall()).rejects.toThrow('Must specify a depth less than history_depth');
		});
		it('Should throw an error inputted era and historydepth is invalid', () => {
			const serviceCall = async () => {
				await stakingPayoutsService.fetchAccountStakingPayout(
					blockHash,
					nominator,
					1,
					ERA,
					true,
					ERA + 134,
					mockHistoricApi,
				);
			};
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(serviceCall()).rejects.toThrow(
				'Must specify era and depth such that era - (depth - 1) is less ' +
					'than or equal to current_era - history_depth.',
			);
		});
	});
	describe('extractExposure', () => {
		it('Should work when the address is a nominator', () => {
			const nom = '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK';
			const val = '16hzCDgyqnm1tskDccVWqxDVXYDLgdrrpC4Guxu3gPgLe5ib';
			const res = stakingPayoutsService['extractExposure'](nom, val, deriveEraExposureParam);
			expect(sanitizeNumbers(res)).toStrictEqual({
				nominatorExposure: '21133134966048676',
				totalExposure: '21133134966048676',
			});
		});
		it('Should work when the address is a validator', () => {
			const val = '16hzCDgyqnm1tskDccVWqxDVXYDLgdrrpC4Guxu3gPgLe5ib';
			const res = stakingPayoutsService['extractExposure'](val, val, deriveEraExposureParam);
			expect(sanitizeNumbers(res)).toStrictEqual({
				nominatorExposure: '0',
				totalExposure: '21133134966048676',
			});
		});
	});
	describe('extractTotalValidatorRewardPoints', () => {
		it('Should return the correct rewards', async () => {
			const rewards = await erasRewardPointsAt(eraIndex);
			const res = stakingPayoutsService['extractTotalValidatorRewardPoints'](rewards, validator);
			expect(sanitizeNumbers(res)).toBe('78920');
		});
	});
	describe('deriveNominatedExposures', () => {
		const res = stakingPayoutsService['deriveNominatedExposures'](nominator, deriveEraExposureParam);
		expect(sanitizeNumbers(res)).toStrictEqual([
			{
				validatorId: '16hzCDgyqnm1tskDccVWqxDVXYDLgdrrpC4Guxu3gPgLe5ib',
				validatorIndex: '0',
			},
		]);
	});
	describe('deriveEraExposure', () => {
		it('Should return the correct derived value', async () => {
			const res = await stakingPayoutsService[`deriveEraExposure`](mockHistoricApi, eraIndex);
			// We check the length of the values since the data is so large.
			expect(res.era.toString()).toEqual('1039');
			expect(Object.keys(res.nominators).length).toEqual(201);
			expect(Object.keys(res.validators).length).toEqual(3);
		});
	});
});
