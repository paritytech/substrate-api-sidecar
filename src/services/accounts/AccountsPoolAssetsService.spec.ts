// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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
import { blockHash5236177, mockAssetHubWestendApi } from '../test-helpers/mock';
import {
	poolAssetApprovals,
	poolAssetsAccount,
	poolAssetsInfoKeysInjected,
	poolAssetsMetadata,
} from '../test-helpers/mock/assets/mockAssetHubWestendData';
import { AccountsPoolAssetsService } from './AccountsPoolAssetsService';

const historicApi = {
	query: {
		poolAssets: {
			account: poolAssetsAccount,
			approvals: poolAssetApprovals,
			asset: poolAssetsInfoKeysInjected(),
			metadata: poolAssetsMetadata,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...mockAssetHubWestendApi,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const accountsPoolAssetsService = new AccountsPoolAssetsService(mockApi);

describe('AccountsPoolAssetsService', () => {
	const at = {
		hash: '0x270c4262eacfd16f05a63ef36eeabf165abbc3a4c53d0480f5460e6d5b2dc8b5',
		height: '5236177',
	};

	describe('AccountsPoolAssetsService.fetchPoolAssetBalances', () => {
		it('Should return the correct response with the pool assets param', async () => {
			const expectedResponse = {
				at,
				poolAssets: [
					{
						assetId: '0',
						balance: '147648230602234',
						isFrozen: 'isFrozen does not exist for this runtime',
						isSufficient: false,
					},
					{
						assetId: '21',
						balance: '100',
						isFrozen: 'isFrozen does not exist for this runtime',
						isSufficient: false,
					},
				],
			};

			const response = await accountsPoolAssetsService.fetchPoolAssetBalances(
				blockHash5236177,
				'0xffff', // AccountId arg here does not affect the test results
				[0, 21],
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});

		it('Should return the correct response without the assets param', async () => {
			const expectedResponse = {
				at,
				poolAssets: [
					{
						assetId: '0',
						balance: '147648230602234',
						isFrozen: 'isFrozen does not exist for this runtime',
						isSufficient: false,
					},
					{
						assetId: '21',
						balance: '100',
						isFrozen: 'isFrozen does not exist for this runtime',
						isSufficient: false,
					},
					{
						assetId: '29',
						balance: '200000',
						isFrozen: true,
						isSufficient: false,
					},
				],
			};

			const response = await accountsPoolAssetsService.fetchPoolAssetBalances(
				blockHash5236177,
				'0xffff', // AccountId arg here does not affect the test results
				[],
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});

	describe('AccountsPoolAssetsService.fetchPoolAssetApprovals', () => {
		it('Should return the correct response', async () => {
			const expectedResponse = {
				at,
				amount: '147648230602234',
				deposit: '2000000',
			};

			const response = await accountsPoolAssetsService.fetchPoolAssetApprovals(
				blockHash5236177,
				'', // AccountId arg here does not affect the test results
				21,
				'', // Delegate arg here does not affect the test results
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
