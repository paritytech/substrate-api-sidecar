/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	activeEraAt,
	blockHash789629,
	erasStartSessionIndexAt,
	mockApi,
} from '../test-helpers/mock';
import * as palletsStakingProgress789629SResponse from '../test-helpers/responses/pallets/stakingProgress789629.json';
import { PalletsStakingProgressService } from './PalletsStakingProgressService';

/**
 * Mock PalletStakingProgressService instance.
 */
const palletStakingProgressService = new PalletsStakingProgressService(mockApi);

describe('PalletStakingProgressService', () => {
	describe('derivePalletStakingProgress', () => {
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

			(mockApi.query.staking
				.erasStartSessionIndex as any).at = erasStartSessionIndexAt;
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
				new InternalServerError(
					'ActiveEra is None when Some was expected.'
				)
			);

			(mockApi.query.staking.activeEra as any).at = activeEraAt;
		});
	});
});
