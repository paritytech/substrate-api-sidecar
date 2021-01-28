/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

		describe('token recognition', () => {
			let tempQueryTokens: any,
				tempQueryBalance: any,
				mockTokensLocksAt: jest.Mock<any>,
				mockTokenAccountAt: jest.Mock<any>,
				mockBalancesLocksAt: jest.Mock<any>;
			beforeAll(() => {
				// Important: these temp values should never be reassinged. They are used so we can assign
				// the mockApi properties back to their original values after this sub-section of tests run.
				tempQueryTokens = mockApi.query.tokens;
				tempQueryBalance = mockApi.query.balances;

				const tokensAccountAt = async (
					hash: Hash,
					address: Address
				): Promise<any> =>
					(((await mockApi.query.system.account.at(
						hash,
						address
					)) as unknown) as AccountInfo).data;
				// Wrap our functions in a jest mock so we can collect data on how they are called
				mockTokensLocksAt = jest.fn(mockApi.query.balances.locks.at);
				mockTokenAccountAt = jest.fn(tokensAccountAt);
				mockApi.query.tokens = {
					locks: { at: mockTokensLocksAt },
					accounts: { at: mockTokenAccountAt },
				} as any;

				mockBalancesLocksAt = jest.fn(mockApi.query.balances.locks.at);
				mockApi.query.balances = {
					locks: { at: mockBalancesLocksAt },
				} as any;
			});

			afterEach(() => {
				// Clear data about how the mocks where called after each `it` test.
				mockTokensLocksAt.mockClear();
				mockTokenAccountAt.mockClear();
				mockBalancesLocksAt.mockClear();
			});

			afterAll(() => {
				mockApi.query.tokens = tempQueryTokens;
				mockApi.query.balances = tempQueryBalance;
			});

			it('only has `["DOT"]` (all uppercase chars) for the mockApi registry', () => {
				expect(mockApi.registry.chainTokens).toStrictEqual(['DOT']);
				expect(mockApi.registry.chainDecimals).toStrictEqual([12]);
			});

			it('querrys tokens pallet storage with a non-native token', async () => {
				expect(
					(sanitizeNumbers(
						await accountsBalanceInfoService.fetchAccountBalanceInfo(
							blockHash789629,
							testAddress,
							'fOoToKeN'
						)
					) as any).tokenSymbol
				).toEqual('fOoToKeN');

				expect(mockTokensLocksAt).toBeCalled();
				expect(mockTokenAccountAt).toBeCalled();
				expect(mockBalancesLocksAt).not.toBeCalled();
			});

			it('does not query tokens pallet storage with the native token', async () => {
				expect(
					(sanitizeNumbers(
						await accountsBalanceInfoService.fetchAccountBalanceInfo(
							blockHash789629,
							testAddress,
							'doT'
						)
					) as any).tokenSymbol
				).toEqual('doT');

				expect(mockTokensLocksAt).not.toBeCalled();
				expect(mockTokenAccountAt).not.toBeCalled();
				expect(mockBalancesLocksAt).toBeCalled();
			});
		});
	});
});
