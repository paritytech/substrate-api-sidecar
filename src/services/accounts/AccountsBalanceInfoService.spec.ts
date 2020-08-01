import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi, testAddress } from '../test-helpers/mock';
import * as accountsBalanceInfo789629 from '../test-helpers/responses/accounts/balanceInfo789629.json';
import { AccountsBalanceInfoService } from './AccountsBalanceInfoService';

const accountsBalanceInfoService = new AccountsBalanceInfoService(mockApi);

describe('AccountsBalanceInfoService', () => {
	describe('fetchAccountBalanceInfo', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await accountsBalanceInfoService.fetchAccountBalanceInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(accountsBalanceInfo789629);
		});
	});
});
