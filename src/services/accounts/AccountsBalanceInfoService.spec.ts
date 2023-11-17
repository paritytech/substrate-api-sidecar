// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { AccountInfo, Address, Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry, polkadotRegistryV9370 } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi, testAddress } from '../test-helpers/mock';
import accountsBalanceInfo789629 from '../test-helpers/responses/accounts/balanceInfo789629.json';
import accountsBalanceInfoFeeFrozen from '../test-helpers/responses/accounts/balanceInfoFeeFrozen.json';
import { AccountsBalanceInfoService } from './AccountsBalanceInfoService';

const locksAt = (_address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<BalanceLock>', '0x047374616b696e672000e8764817000000000000000000000002'),
	);

const accountAt = (_address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'AccountInfo',
			'0x0600000003dbb656ab7400000000000000000000000000000000000000000000000000000000e8764817000000000000000000000000e87648170000000000000000000000',
		),
	);

const accountDataAt = (_address: String) =>
	Promise.resolve().then(() => {
		return {
			data: polkadotRegistryV9370.createType('AccountData', {
				free: '100000',
				reserved: '100000',
				miscFrozen: '111111',
				feeFrozen: '111111',
			}),
			nonce: polkadotRegistry.createType('Index', 1),
		};
	});

const freeBalanceAt = () => Promise.resolve().then(() => polkadotRegistry.createType('Balance', 123456789));

const mockHistoricApi = {
	registry: polkadotRegistry,
	query: {
		balances: {
			freeBalance: freeBalanceAt,
			reservedBalance: async () => polkadotRegistry.createType('Balance', 1),
			locks: locksAt,
		},
		system: {
			accountNonce: async () => polkadotRegistry.createType('Index', 1),
			account: accountAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const accountsBalanceInfoService = new AccountsBalanceInfoService(mockApi);

describe('AccountsBalanceInfoService', () => {
	describe('fetchAccountBalanceInfo', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			const tempHistoricApi = { ...mockHistoricApi };
			(tempHistoricApi.query.balances.freeBalance as unknown) = undefined;

			const tempMockApi = {
				...defaultMockApi,
				at: (_hash: Hash) => tempHistoricApi,
			} as unknown as ApiPromise;

			const tempAccountsBalanceInfoService = new AccountsBalanceInfoService(tempMockApi);

			expect(
				sanitizeNumbers(
					await tempAccountsBalanceInfoService.fetchAccountBalanceInfo(
						blockHash789629,
						mockHistoricApi,
						testAddress,
						'DOT',
						false,
					),
				),
			).toStrictEqual(accountsBalanceInfo789629);
		});

		it('works when the api does not have the frozen field in Account data', async () => {
			const tmpHistoricApi = {
				registry: polkadotRegistry,
				query: {
					balances: {
						freeBalance: undefined,
						reservedBalance: async () => polkadotRegistry.createType('Balance', 1),
						locks: locksAt,
					},
					system: {
						accountNonce: async () => polkadotRegistry.createType('Index', 1),
						account: accountDataAt,
					},
				},
			} as unknown as ApiDecoration<'promise'>;

			const tmpMockApi = {
				...defaultMockApi,
				at: (_hash: Hash) => tmpHistoricApi,
			} as unknown as ApiPromise;

			const tmpAccountsBalanceInfoService = new AccountsBalanceInfoService(tmpMockApi);

			expect(
				sanitizeNumbers(
					await tmpAccountsBalanceInfoService.fetchAccountBalanceInfo(
						blockHash789629,
						tmpHistoricApi,
						testAddress,
						'DOT',
						false,
					),
				),
			).toStrictEqual(accountsBalanceInfoFeeFrozen);
		});

		it('Correctly queries historical blocks', async () => {
			const result = await accountsBalanceInfoService.fetchAccountBalanceInfo(
				blockHash789629,
				mockHistoricApi,
				testAddress,
				'DOT',
				false,
			);

			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '789629',
				},
				feeFrozen: '100000000000',
				free: '501090793179',
				frozen: 'frozen does not exist for this runtime',
				locks: [
					{
						amount: '100000000000',
						id: '0x7374616b696e6720',
						reasons: 'All',
					},
				],
				miscFrozen: '100000000000',
				nonce: '6',
				reserved: '0',
				tokenSymbol: 'DOT',
			};

			expect(sanitizeNumbers(result)).toStrictEqual(expectedResponse);
		});

		describe('token recognition', () => {
			const tokenHistoricApi = { ...mockHistoricApi };
			Object.assign(tokenHistoricApi.query.system.account, { at: true });
			(tokenHistoricApi.query.balances.freeBalance as unknown) = undefined;

			const tokenMockApi = {
				...defaultMockApi,
				at: (_hash: Hash) => tokenHistoricApi,
			} as unknown as ApiPromise;

			const tokenAccountsBalanceInfoService = new AccountsBalanceInfoService(tokenMockApi);

			let tempQueryTokens: any,
				tempQueryBalance: any,
				mockTokensLocksAt: jest.Mock<any>,
				mockTokenAccountAt: jest.Mock<any>,
				mockBalancesLocksAt: jest.Mock<any>;
			beforeAll(() => {
				// Important: these temp values should never be reassinged. They are used so we can assign
				// the mockApi properties back to their original values after this sub-section of tests run.
				tempQueryTokens = tokenHistoricApi.query.tokens;
				tempQueryBalance = tokenHistoricApi.query.balances;

				const tokensAccountAt = async (address: Address): Promise<any> =>
					((await tokenHistoricApi.query.system.account(address)) as unknown as AccountInfo).data;
				// Wrap our functions in a jest mock so we can collect data on how they are called
				mockTokensLocksAt = jest.fn(tokenHistoricApi.query.balances.locks);
				mockTokenAccountAt = jest.fn(tokensAccountAt);
				tokenHistoricApi.query.tokens = {
					locks: mockTokensLocksAt,
					accounts: mockTokenAccountAt,
				} as any;

				mockBalancesLocksAt = jest.fn(tokenHistoricApi.query.balances.locks);
				(tokenHistoricApi.query.balances.locks as unknown) = mockBalancesLocksAt;
			});

			afterEach(() => {
				// Clear data about how the mocks where called after each `it` test.
				mockTokensLocksAt.mockClear();
				mockTokenAccountAt.mockClear();
				mockBalancesLocksAt.mockClear();
			});

			afterAll(() => {
				tokenHistoricApi.query.tokens = tempQueryTokens;
				tokenHistoricApi.query.balances = tempQueryBalance;
			});

			it('only has `["DOT"]` (all uppercase chars) for the mockApi registry', () => {
				expect(tokenHistoricApi.registry.chainTokens).toStrictEqual(['DOT']);
				expect(tokenHistoricApi.registry.chainDecimals).toStrictEqual([12]);
			});

			it('querrys tokens pallet storage with a non-native token', async () => {
				expect(
					(
						sanitizeNumbers(
							await tokenAccountsBalanceInfoService.fetchAccountBalanceInfo(
								blockHash789629,
								tokenHistoricApi,
								testAddress,
								'fOoToKeN',
								false,
							),
						) as any
					).tokenSymbol,
				).toEqual('fOoToKeN');

				expect(mockTokensLocksAt).toBeCalled();
				expect(mockTokenAccountAt).toBeCalled();
				expect(mockBalancesLocksAt).not.toBeCalled();
			});

			it('does not query tokens pallet storage with the native token', async () => {
				expect(
					(
						sanitizeNumbers(
							await tokenAccountsBalanceInfoService.fetchAccountBalanceInfo(
								blockHash789629,
								tokenHistoricApi,
								testAddress,
								'doT',
								false,
							),
						) as any
					).tokenSymbol,
				).toEqual('doT');

				expect(mockTokensLocksAt).not.toBeCalled();
				expect(mockTokenAccountAt).not.toBeCalled();
				expect(mockBalancesLocksAt).toBeCalled();
			});
		});
	});

	describe('applyDenomination', () => {
		const balance = polkadotRegistry.createType('Balance', 12345);

		it('Should correctly denominate a balance when balance.length <= decimal', () => {
			const ltValue = accountsBalanceInfoService['applyDenominationBalance'](balance, 7);
			const etValue = accountsBalanceInfoService['applyDenominationBalance'](balance, 5);

			expect(ltValue).toBe('.0012345');
			expect(etValue).toBe('.12345');
		});

		it('Should correctly denominate a balance when balance.length > decimal', () => {
			const value = accountsBalanceInfoService['applyDenominationBalance'](balance, 3);

			expect(value).toBe('12.345');
		});

		it('Should correctly denominate a balance when balance is equal to zero', () => {
			const zeroBalance = polkadotRegistry.createType('Balance', 0);
			const value = accountsBalanceInfoService['applyDenominationBalance'](zeroBalance, 2);

			expect(value).toBe('0');
		});

		it('Should correctly denominate a balance when the decimal value is zero', () => {
			const value = accountsBalanceInfoService['applyDenominationBalance'](balance, 0);

			expect(value).toBe('12345');
		});
	});

	describe('denominateLocks', () => {
		it('Should correctly parse and denominate a Vec<BalanceLocks>', () => {
			const balanceLock = polkadotRegistry.createType('BalanceLock', {
				id: '0x7374616b696e6720',
				amount: 12345,
				reasons: 'All',
			});
			const vecLocks = polkadotRegistry.createType('Vec<BalanceLock>', [balanceLock]);
			const value = accountsBalanceInfoService['applyDenominationLocks'](vecLocks, 3);
			const expectedValue = [{ amount: '12.345', id: '0x7374616b696e6720', reasons: 'All' }];

			expect(sanitizeNumbers(value)).toStrictEqual(expectedValue);
		});

		it('Should handle an empty Vec correctly', () => {
			const vecLocks = polkadotRegistry.createType('Vec<BalanceLock>', []);
			const value = accountsBalanceInfoService['applyDenominationLocks'](vecLocks, 3);

			expect(sanitizeNumbers(value)).toStrictEqual([]);
		});
	});
});
