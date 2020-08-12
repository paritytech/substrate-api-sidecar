import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi, testAddress } from '../test-helpers/mock';
import * as response789629 from '../test-helpers/responses/accounts/vestingInfo789629.json';
import { AccountsVestingInfoService } from './AccountsVestingInfoService';

const accountsVestingInfoService = new AccountsVestingInfoService(mockApi);

describe('AccountVestingInfoService', () => {
	describe('fetchAccountVestingInfo', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(response789629);
		});
	});
});
