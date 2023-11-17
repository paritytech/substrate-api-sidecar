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

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash5236177, mockAssetHubWestendApi } from '../test-helpers/mock';
import {
	poolAssetApprovals,
	poolAssetsAccount,
	poolAssetsInfo,
	poolAssetsMetadata,
} from '../test-helpers/mock/assets/mockAssetHubWestendData';
import { PalletsPoolAssetsService } from './PalletsPoolAssetsService';

const mockApi = {
	...mockAssetHubWestendApi,
	query: {
		poolAssets: {
			asset: poolAssetsInfo,
			approvals: poolAssetApprovals,
			account: poolAssetsAccount,
			metadata: poolAssetsMetadata,
		},
	},
} as unknown as ApiPromise;

const palletsPoolAssetsService = new PalletsPoolAssetsService(mockApi);

describe('PalletsPoolAssetsService', () => {
	describe('PalletsPoolAssetsService.fetchPoolAssetById', () => {
		it('Should return the correct response for a Pool AssetId', async () => {
			const expectedResponse = {
				at: {
					hash: '0x270c4262eacfd16f05a63ef36eeabf165abbc3a4c53d0480f5460e6d5b2dc8b5',
					height: '5236177',
				},
				poolAssetInfo: {
					owner: '5D8Rj3PcZaTDETw2tK67APJVXEubgo7du83kaFXvju3ASToj',
					issuer: '5D8Rj3PcZaTDETw2tK67APJVXEubgo7du83kaFXvju3ASToj',
					admin: '5D8Rj3PcZaTDETw2tK67APJVXEubgo7du83kaFXvju3ASToj',
					freezer: '5D8Rj3PcZaTDETw2tK67APJVXEubgo7du83kaFXvju3ASToj',
					supply: '48989794',
					deposit: '0',
					minBalance: '1',
					isSufficient: false,
					accounts: '2',
					sufficients: '0',
					approvals: '0',
					status: 'Live',
				},
				poolAssetMetaData: {
					deposit: '0',
					name: '0x',
					symbol: '0x',
					decimals: '0',
					isFrozen: false,
				},
			};

			const response = await palletsPoolAssetsService.fetchPoolAssetById(blockHash5236177, 21);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
