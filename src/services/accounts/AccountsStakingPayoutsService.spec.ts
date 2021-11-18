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
import { polkadotRegistryV9110 } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import {
	mockDeriveNominatedExposure,
	mockDeriveValidatorExposure,
	mockEraRewardPoints,
	mockLedger,
} from '../test-helpers/mock/accounts';
import stakingPayoutsResponse from '../test-helpers/responses/accounts/stakingPayout.json';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

const historyDepthAt = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType('u32', 84);
	});

const erasRewardPointsAt = (
	_eraIndex: EraIndex
): Promise<PalletStakingEraRewardPoints | Codec> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType(
			'PalletStakingEraRewardPoints',
			mockEraRewardPoints
		);
	});

const erasValidatorRewardAt = (
	_eraIndex: EraIndex
): Promise<Option<BalanceOf>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType(
			'Option<BalanceOf>',
			2426740332127971
		);
	});

const erasValidatorPrefsAt = (
	_era: u32 | number,
	_validatorId: string | AccountId32
): Promise<PalletStakingValidatorPrefs | Codec> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType('PalletStakingValidatorPrefs', {
			commission: 10000000,
			blocked: false,
		});
	});

const bondedAt = (
	_validatorId: string | AccountId32
): Promise<Option<AccountId32>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType(
			'Option<AccountId32>',
			'1ZMbuCR3QiatxRsQdNnJYgydn3CWV4PELcTzpH4TNoNjxno'
		);
	});

const ledgerAt = (
	_validatorId: string | AccountId32
): Promise<Option<PalletStakingStakingLedger | Codec>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9110.createType(
			'Option<PalletStakingStakingLedger>',
			mockLedger
		);
	});

const deriveEraExposure = (_eraIndex: EraIndex): Promise<DeriveEraExposure> =>
	Promise.resolve().then(() => {
		const era = polkadotRegistryV9110.createType('EraIndex', 532);
		return {
			era,
			nominators: mockDeriveNominatedExposure,
			validators: mockDeriveValidatorExposure,
		} as unknown as DeriveEraExposure;
	});

const mockHistoricApi = {
	registry: polkadotRegistryV9110,
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
	const blockHash = polkadotRegistryV9110.createType(
		'BlockHash',
		'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578'
	);

	describe('Correct succesful responses', () => {
		it('Should work when ApiPromise works', async () => {
			const res = await stakingPayoutsService.fetchAccountStakingPayout(
				blockHash,
				'15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
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
				'15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
				1,
				533,
				false,
				534
			);

			expect(sanitizeNumbers(res)).toStrictEqual(stakingPayoutsResponse);
		});
	});

	describe('Correct errors', () => {
		it('Should throw an error when the depth is greater than the historyDepth', () => {
			const serviceCall = async () => {
				await stakingPayoutsService.fetchAccountStakingPayout(
					blockHash,
					'15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
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
					'15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
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
