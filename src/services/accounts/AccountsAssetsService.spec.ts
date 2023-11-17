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

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import {
	assetApprovals,
	assetsAccount,
	assetsInfoKeysInjected,
	assetsMetadata,
} from '../test-helpers/mock/assets/mockAssetData';
import { AccountsAssetsService } from './AccountsAssetsService';

const historicApi = {
	query: {
		assets: {
			account: assetsAccount,
			approvals: assetApprovals,
			asset: assetsInfoKeysInjected(),
			metadata: assetsMetadata,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const accountsAssetsService = new AccountsAssetsService(mockApi);

describe('AccountsAssetsService', () => {
	const at = {
		hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
		height: '789629',
	};

	describe('AccountsAssetsService.fetchAssetBalances', () => {
		it('Should return the correct response with the assets param', async () => {
			const expectedResponse = {
				at,
				assets: [
					{
						assetId: '10',
						balance: '10000000',
						isFrozen: false,
						isSufficient: true,
					},
					{
						assetId: '20',
						balance: '20000000',
						isFrozen: true,
						isSufficient: true,
					},
				],
			};

			const response = await accountsAssetsService.fetchAssetBalances(
				blockHash789629,
				'0xffff', // AccountId arg here does not affect the test results
				[10, 20],
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});

		it('Should return the correct response without the assets param', async () => {
			const expectedResponse = {
				at,
				assets: [
					{
						assetId: '10',
						balance: '10000000',
						isFrozen: false,
						isSufficient: true,
					},
					{
						assetId: '20',
						balance: '20000000',
						isFrozen: true,
						isSufficient: true,
					},
					{
						assetId: '30',
						balance: '20000000',
						isFrozen: false,
						isSufficient: false,
					},
				],
			};

			const response = await accountsAssetsService.fetchAssetBalances(
				blockHash789629,
				'0xffff', // AccountId arg here does not affect the test results
				[],
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});

	describe('AccountsAssetsService.fetchAssetApproval', () => {
		it('Should return the correct response', async () => {
			const expectedResponse = {
				at,
				amount: '10000000',
				deposit: '2000000',
			};

			const response = await accountsAssetsService.fetchAssetApproval(
				blockHash789629,
				'', // AccountId arg here does not affect the test results
				10,
				'', // Delegate arg here does not affect the test results
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
