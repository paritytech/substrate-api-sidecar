import { ApiPromise } from '@polkadot/api';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import {
	assetApprovals,
	assetsAccount,
	assetsInfo,
	assetsMetadata,
} from '../test-helpers/mock/assets/mockAssetData';
import { PalletsAssetsService } from './PalletsAssetsService';

const mockApi = {
	...defaultMockApi,
	query: {
		assets: {
			asset: assetsInfo,
			approvals: assetApprovals,
			account: assetsAccount,
			metadata: assetsMetadata,
		},
	},
} as unknown as ApiPromise;

const palletsAssetsService = new PalletsAssetsService(mockApi);

describe('PalletsAssetsService', () => {
	describe('PalletsAssetsService.fetchAssetById', () => {
		it('Should return the correct response for an AssetId', async () => {
			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '789629',
				},
				assetInfo: {
					owner: '5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N',
					issuer: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
					admin: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
					freezer: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
					supply: '10000000',
					deposit: '2000000',
					minBalance: '10000',
					isSufficient: true,
					accounts: '10',
					sufficients: '15',
					approvals: '20',
					isFrozen: false,
				},
				assetMetaData: {
					deposit: '2000000',
					name: '0x73746174656d696e74',
					symbol: '0x444f54',
					decimals: '10',
					isFrozen: false,
				},
			};

			const response = await palletsAssetsService.fetchAssetById(
				blockHash789629,
				10
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
