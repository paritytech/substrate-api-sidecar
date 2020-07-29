import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi, zugAddress } from '../mock/mockApi';
import { AccountsVestingInfoService } from './AccountsVestingInfoService';

const accountsVestingInfoService = new AccountsVestingInfoService(mockApi);

describe('AccountVestingInfoService', () => {
	describe('fetchAccountVestingInfo', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						zugAddress
					)
				)
			);
		});
	});
});
