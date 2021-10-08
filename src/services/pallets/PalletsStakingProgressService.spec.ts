/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiPromise } from '@polkadot/api';
import { EraIndex, Hash } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	activeEraAt,
	blockHash789629,
	defaultMockApi,
	erasStartSessionIndexAt,
} from '../test-helpers/mock';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import palletsStakingProgress789629SResponse from '../test-helpers/responses/pallets/stakingProgress789629.json';
import { PalletsStakingProgressService } from './PalletsStakingProgressService';

const epochIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 330));

const genesisSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265084563));

const currentSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265876724));

const currentIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('SessionIndex', 330)
	);

const eraElectionStatusAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ElectionStatus', { Close: null })
	);

const validatorsAt = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<ValidatorId>', validators789629Hex)
	);

const forceEraAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Forcing', 'NotForcing')
	);

const unappliedSlashesAt = (_hash: Hash, _activeEra: EraIndex) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<UnappliedSlash>', [])
	);

const validatorCountAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u32', 197));

const mockApi = {
	...defaultMockApi,
	consts: {
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
	},
	query: {
		babe: {
			currentSlot: { at: currentSlotAt },
			epochIndex: { at: epochIndexAt },
			genesisSlot: { at: genesisSlotAt },
		},
		session: {
			currentIndex: { at: currentIndexAt },
			validators: validatorsAt,
		},
		staking: {
			activeEra: { at: activeEraAt },
			eraElectionStatus: { at: eraElectionStatusAt },
			erasStartSessionIndex: { at: erasStartSessionIndexAt },
			forceEra: { at: forceEraAt },
			unappliedSlashes: { at: unappliedSlashesAt },
			validatorCount: { at: validatorCountAt },
		},
	},
} as unknown as ApiPromise;

/**
 * Mock PalletStakingProgressService instance.
 */
const palletStakingProgressService = new PalletsStakingProgressService(mockApi);

describe('PalletStakingProgressService', () => {
	describe('derivePalletStakingProgress', () => {
		(mockApi.query.session.validators as unknown) = { at: validatorsAt };

		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await palletStakingProgressService.derivePalletStakingProgress(
						blockHash789629
					)
				)
			).toStrictEqual(palletsStakingProgress789629SResponse);
		});

		it('throws when ErasStartSessionIndex.isNone', async () => {
			(mockApi.query.staking.erasStartSessionIndex as any).at = () =>
				Promise.resolve().then(() =>
					polkadotRegistry.createType('Option<SessionIndex>', null)
				);

			await expect(
				palletStakingProgressService.derivePalletStakingProgress(
					blockHash789629
				)
			).rejects.toStrictEqual(
				new InternalServerError(
					'EraStartSessionIndex is None when Some was expected.'
				)
			);

			(mockApi.query.staking.erasStartSessionIndex as any).at =
				erasStartSessionIndexAt;
		});

		it('throws when activeEra.isNone', async () => {
			(mockApi.query.staking.activeEra as any).at = () =>
				Promise.resolve().then(() =>
					polkadotRegistry.createType('Option<ActiveEraInfo>', null)
				);

			await expect(
				palletStakingProgressService.derivePalletStakingProgress(
					blockHash789629
				)
			).rejects.toStrictEqual(
				new InternalServerError('ActiveEra is None when Some was expected.')
			);

			(mockApi.query.staking.activeEra as any).at = activeEraAt;
			(mockApi.query.session.validators as unknown) = validatorsAt;
		});
	});
});
