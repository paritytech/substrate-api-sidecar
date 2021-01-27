/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { AccountInfo, Address, Hash } from '@polkadot/types/interfaces';

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
						testAddress,
						'DOT'
					)
				)
			).toStrictEqual(accountsBalanceInfo789629);
		});

		it('does not change the casing of non-native tokens', async () => {
			// `temp` should just be `undefined` but to future proof this it is safer
			// to reassign this back to what ever it was at the start of the test (see
			// last line of this test)
			const temp = mockApi.query.tokens;

			const tokensAccountAt = async (
				hash: Hash,
				address: Address
			): Promise<any> =>
				(((await mockApi.query.system.account.at(
					hash,
					address
				)) as unknown) as AccountInfo).data;
			mockApi.query.tokens = {
				locks: { at: mockApi.query.balances.locks.at },
				accounts: { at: tokensAccountAt },
			} as any;

			expect(
				(sanitizeNumbers(
					await accountsBalanceInfoService.fetchAccountBalanceInfo(
						blockHash789629,
						testAddress,
						'ausd'
					)
				) as any).tokenSymbol
			).toEqual('ausd');

			// Cleanup
			mockApi.query.tokens = temp;
		});
	});
});
