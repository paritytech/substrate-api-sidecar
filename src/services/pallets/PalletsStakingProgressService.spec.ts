import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../mock/mockApi';
import * as palletsStakingProgressResponse from './palletsStakingProgressResponse.json';
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
			).toStrictEqual(palletsStakingProgressResponse);
		});
	});
});
