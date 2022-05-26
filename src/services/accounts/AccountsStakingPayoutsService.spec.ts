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
import { DeriveEraExposure } from '@polkadot/api-derive/types';
import { Option, u32 } from '@polkadot/types';
import {
	AccountId32,
	BalanceOf,
	EraIndex,
	Hash,
} from '@polkadot/types/interfaces';
import {
	PalletStakingEraRewardPoints,
	PalletStakingStakingLedger,
	PalletStakingValidatorPrefs,
} from '@polkadot/types/lookup';
import { Codec } from '@polkadot/types/types';
import { BadRequest } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9122 } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import {
	mockDeriveNominatedExposure,
	mockDeriveValidatorExposure,
	mockEraRewardPoints,
	mockLedger,
} from '../test-helpers/mock/accounts';
import stakingPayoutsResponse from '../test-helpers/responses/accounts/stakingPayout.json';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

/**
 * Addresses and data below were taken from era 533 around block ~7,760,000,
 * on runtime v9122 Polkadot.
 *
 * The real world data has been reduced to fit the unit tests and act as mock data.
 * This test suite also uses polkadotRegistryV9122
 */

/**
 * Acts as a placeholder variable for some tests where the era isn't an instrumental
 * factor to the test logic.
 */
const era = polkadotRegistryV9122.createType('EraIndex', 532);

const historyDepthAt = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType('u32', 84);
	});

const erasRewardPointsAt = (
	_eraIndex: EraIndex
): Promise<PalletStakingEraRewardPoints | Codec> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType(
			'PalletStakingEraRewardPoints',
			mockEraRewardPoints
		);
	});

const erasValidatorRewardAt = (
	_eraIndex: EraIndex
): Promise<Option<BalanceOf>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType(
			'Option<BalanceOf>',
			2426740332127971
		);
	});

const erasValidatorPrefsAt = (
	_era: u32 | number,
	_validatorId: string | AccountId32
): Promise<PalletStakingValidatorPrefs | Codec> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType('PalletStakingValidatorPrefs', {
			commission: 10000000,
			blocked: false,
		});
	});

const bondedAt = (
	_validatorId: string | AccountId32
): Promise<Option<AccountId32>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType(
			'Option<AccountId32>',
			'1ZMbuCR3QiatxRsQdNnJYgydn3CWV4PELcTzpH4TNoNjxno'
		);
	});

const ledgerAt = (
	_validatorId: string | AccountId32
): Promise<Option<PalletStakingStakingLedger | Codec>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9122.createType(
			'Option<PalletStakingStakingLedger>',
			mockLedger
		);
	});

const deriveEraExposure = (_eraIndex: EraIndex): Promise<DeriveEraExposure> =>
	Promise.resolve().then(() => {
		return {
			era,
			nominators: mockDeriveNominatedExposure,
			validators: mockDeriveValidatorExposure,
		} as unknown as DeriveEraExposure;
	});

const mockHistoricApi = {
	registry: polkadotRegistryV9122,
	query: {
		staking: {
			ledger: ledgerAt,
			erasRewardPoints: erasRewardPointsAt,
			erasValidatorReward: erasValidatorRewardAt,
			historyDepth: historyDepthAt,
			erasValidatorPrefs: erasValidatorPrefsAt,
			bonded: bondedAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	derive: {
		staking: {
			eraExposure: deriveEraExposure,
		},
	},
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const stakingPayoutsService = new AccountsStakingPayoutsService(mockApi);

describe('AccountsStakingPayoutsService', () => {
	/**
	 * These are the two addresses we test the validator and nominator cases on.
	 */
	const nominator = '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK';
	const validator = '12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo';

	const blockHash = polkadotRegistryV9122.createType(
		'BlockHash',
		'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578'
	);

	let derivedExposure: DeriveEraExposure;
	beforeAll(async () => {
		derivedExposure = await deriveEraExposure(era);
	});

	describe('Correct succesfull responses', () => {
		it('Should work when ApiPromise works', async () => {
			const res = await stakingPayoutsService.fetchAccountStakingPayout(
				blockHash,
				nominator,
				1,
				533,
				true,
				534
			);

			expect(sanitizeNumbers(res)).toStrictEqual(stakingPayoutsResponse);
		});

		it('Should work when unclaimed is false', async () => {
			const res = await stakingPayoutsService.fetchAccountStakingPayout(
				blockHash,
				nominator,
				1,
				533,
				false,
				534
			);

			expect(sanitizeNumbers(res)).toStrictEqual(stakingPayoutsResponse);
		});

		it('Should return the correct era rewards for `extractTotalValidatorRewardPoints`', async () => {
			const rewards = await erasRewardPointsAt(era);
			const res = stakingPayoutsService['extractTotalValidatorRewardPoints'](
				rewards as unknown as PalletStakingEraRewardPoints,
				validator
			);
			expect(sanitizeNumbers(res)).toBe('3360');
		});

		it('`extractExposure` should return the correct value when the address is a nominator', () => {
			const res = stakingPayoutsService['extractExposure'](
				nominator,
				validator,
				derivedExposure
			);
			expect(sanitizeNumbers(res)).toStrictEqual({
				nominatorExposure: '33223051661066606',
				totalExposure: '33223251661066606',
			});
		});

		it('`extractExposure` should return the correct value when the address is a validator', () => {
			const res = stakingPayoutsService['extractExposure'](
				validator,
				validator,
				derivedExposure
			);
			expect(sanitizeNumbers(res)).toStrictEqual({
				nominatorExposure: '200000000000',
				totalExposure: '33223251661066606',
			});
		});

		it('`deriveNominatedExposures` should return the correct value when address is a validator', () => {
			const res = stakingPayoutsService['deriveNominatedExposures'](
				'12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo',
				derivedExposure
			);
			const expectedResult = [
				{
					validatorId: '1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw',
					validatorIndex: '0',
				},
				{
					validatorId: '12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo',
					validatorIndex: '9999',
				},
			];
			expect(sanitizeNumbers(res)).toStrictEqual(expectedResult);
		});

		it('`deriveNominatedExposures` should return the correct value when the address is a nominator', () => {
			const res = stakingPayoutsService['deriveNominatedExposures'](
				nominator,
				derivedExposure
			);
			expect(sanitizeNumbers(res)).toStrictEqual(
				mockDeriveNominatedExposure[nominator]
			);
		});
	});

	describe('Correct errors', () => {
		it('Should throw an error when the depth is greater than the historyDepth', () => {
			const serviceCall = async () => {
				await stakingPayoutsService.fetchAccountStakingPayout(
					blockHash,
					nominator,
					85,
					533,
					true,
					534
				);
			};

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(serviceCall()).rejects.toThrow(
				new BadRequest('Must specify a depth less than history_depth')
			);
		});

		it('Should throw an error inputted era and historydepth is invalid', () => {
			const serviceCall = async () => {
				await stakingPayoutsService.fetchAccountStakingPayout(
					blockHash,
					nominator,
					1,
					400,
					true,
					534
				);
			};

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(serviceCall()).rejects.toThrow(
				new BadRequest(
					'Must specify era and depth such that era - (depth - 1) is less ' +
						'than or equal to current_era - history_depth.'
				)
			);
		});
	});
});
