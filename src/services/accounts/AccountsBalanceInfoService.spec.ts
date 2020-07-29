import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi, testAddress } from '../mock/mockApi';
import * as accountsBalanceInfo789629 from './accountsBalanceInfo789629.json';
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
