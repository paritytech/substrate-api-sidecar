/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import { AccountInfo, Address, Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotMetadata } from '../../test-helpers/metadata/metadata';
import { polkadotRegistry } from '../../test-helpers/registries';
import { createApiWithAugmentations } from '../../test-helpers/typeFactory';
import { blockHash789629, mockApi, testAddress } from '../test-helpers/mock';
import accountsBalanceInfo789629 from '../test-helpers/responses/accounts/balanceInfo789629.json';
import { AccountsBalanceInfoService } from './AccountsBalanceInfoService';

const accountsBalanceInfoService = new AccountsBalanceInfoService(mockApi);

/**
 * Historical Queries MockApi
 */
const historicalMockApi = {
	query: {
		balances: {
			freeBalance: async () =>
				polkadotRegistry.createType('Balance', 123456789),
			reservedBalance: async () => polkadotRegistry.createType('Balance', 1),
			locks: async () => polkadotRegistry.createType('Vec<BalanceLock>', []),
		},
		system: {
			accountNonce: async () => polkadotRegistry.createType('Index', 1),
		},
	},
};

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
					(
						(await mockApi.query.system.account.at(
							hash,
							address
						)) as unknown as AccountInfo
					).data;
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
					(
						sanitizeNumbers(
							await accountsBalanceInfoService.fetchAccountBalanceInfo(
								blockHash789629,
								testAddress,
								'fOoToKeN'
							)
						) as any
					).tokenSymbol
				).toEqual('fOoToKeN');

				expect(mockTokensLocksAt).toBeCalled();
				expect(mockTokenAccountAt).toBeCalled();
				expect(mockBalancesLocksAt).not.toBeCalled();
			});

			it('does not query tokens pallet storage with the native token', async () => {
				expect(
					(
						sanitizeNumbers(
							await accountsBalanceInfoService.fetchAccountBalanceInfo(
								blockHash789629,
								testAddress,
								'doT'
							)
						) as any
					).tokenSymbol
				).toEqual('doT');

				expect(mockTokensLocksAt).not.toBeCalled();
				expect(mockTokenAccountAt).not.toBeCalled();
				expect(mockBalancesLocksAt).toBeCalled();
			});

			it('Correctly queries historical blocks', async () => {
				// Set the at to a historical runtime, before the storage key format changed
				(mockApi.at as unknown) = () =>
					Promise.resolve().then(() => historicalMockApi);

				const result = await accountsBalanceInfoService.fetchAccountBalanceInfo(
					blockHash789629,
					testAddress,
					'DOT'
				);

				const expectedResponse = {
					at: {
						hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
						height: '789629',
					},
					feeFrozen: '0',
					free: '123456789',
					locks: [],
					miscFrozen: '0',
					nonce: '1',
					reserved: '1',
					tokenSymbol: 'DOT',
				};

				expect(sanitizeNumbers(result)).toStrictEqual(expectedResponse);

				mockApi.at = async () =>
					createApiWithAugmentations(polkadotMetadata.toHex());
			});
		});
	});
});
