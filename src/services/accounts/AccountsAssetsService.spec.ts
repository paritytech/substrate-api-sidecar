import { ApiPromise } from '@polkadot/api';
import { AssetId } from '@polkadot/types/interfaces';
import { PalletAssetsAssetBalance } from '@polkadot/types/lookup';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { statemintV1 } from '../../test-helpers/metadata/statemintMetadata';
import { rococoRegistry } from '../../test-helpers/registries';
import { createApiWithAugmentations } from '../../test-helpers/typeFactory';
import { TypeFactory } from '../../test-helpers/typeFactory';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { AccountsAssetsService } from './AccountsAssetsService';

const statemintApiV1 = createApiWithAugmentations(statemintV1);
const statemintTypeFactory = new TypeFactory(statemintApiV1);

const falseBool = rococoRegistry.createType('bool', false);
const trueBool = rococoRegistry.createType('bool', true);
const assetTBalanceOne = rococoRegistry.createType('u64', 10000000);
const assetTBalanceTwo = rococoRegistry.createType('u64', 20000000);

const accountIdOne = rococoRegistry.createType(
	'AccountId',
	'1TYrFCWxwHA5bhiXf6uLvPfG6eEvrzzL7uiPK3Yc6yHLUqc'
);
const accountIdTwo = rococoRegistry.createType(
	'AccountId',
	'13NXiLYYzVEjXxU3eaZNcrjEX9vPyVDNNpURCzK8Bj9BiCWH'
);
const balanceOfTwo = rococoRegistry.createType('BalanceOf', 2000000);

const assetsInfo = () =>
	Promise.resolve().then(() => {
		const responseObj = {
			owner: accountIdOne,
			issue: accountIdTwo,
			admin: accountIdTwo,
			freezer: accountIdTwo,
			supply: assetTBalanceOne,
			deposit: balanceOfTwo,
			minBalance: rococoRegistry.createType('u64', 10000),
			isSufficient: trueBool,
			accounts: rococoRegistry.createType('u32', 10),
			sufficients: rococoRegistry.createType('u32', 15),
			approvals: rococoRegistry.createType('u32', 20),
			isFrozen: falseBool,
		};

		return rococoRegistry.createType('AssetDetails', responseObj);
	});

const assetsMetadata = () =>
	Promise.resolve().then(() => {
		const responseObj = {
			deposit: balanceOfTwo,
			name: rococoRegistry.createType('Bytes', 'statemint'),
			symbol: rococoRegistry.createType('Bytes', 'DOT'),
			decimals: rococoRegistry.createType('u8', 10),
			isFrozen: falseBool,
		};

		return rococoRegistry.createType('AssetMetadata', responseObj);
	});

const assetBalanceObjOne = {
	balance: assetTBalanceOne,
	isFrozen: falseBool,
	sufficient: trueBool,
};

const assetBalanceObjTwo = {
	balance: assetTBalanceTwo,
	isFrozen: trueBool,
	sufficient: trueBool,
};

const assetBalanceObjThree = {
	balance: assetTBalanceTwo,
	isFrozen: falseBool,
	sufficient: falseBool,
};

const assetBalanceFactory = {
	'10': assetBalanceObjOne as PalletAssetsAssetBalance,
	'20': assetBalanceObjTwo as PalletAssetsAssetBalance,
	'30': assetBalanceObjThree as PalletAssetsAssetBalance,
};

const assetStorageKeyOne = statemintTypeFactory.storageKey(
	10,
	'AssetId',
	statemintApiV1.query.assets.asset
);

const assetStorageKeyTwo = statemintTypeFactory.storageKey(
	20,
	'AssetId',
	statemintApiV1.query.assets.asset
);

const assetStorageKeyThree = statemintTypeFactory.storageKey(
	30,
	'AssetId',
	statemintApiV1.query.assets.asset
);

const assetsAccountKeysAt = () =>
	Promise.resolve().then(() => {
		return [assetStorageKeyOne, assetStorageKeyTwo, assetStorageKeyThree];
	});

/**
 * Attach `keysAt` to mockApi.query.assets.asset
 */
Object.assign(assetsInfo, {
	keysAt: assetsAccountKeysAt,
});

/**
 * @param assetId options are 10, 20, 30
 */
const assetsAccount = (assetId: number | AssetId, _address: string) => {
	const id = typeof assetId === 'number' ? assetId : assetId.toNumber();

	switch (id) {
		case 10:
			return assetBalanceFactory[10];
		case 20:
			return assetBalanceFactory[20];
		case 30:
			return assetBalanceFactory[30];
		default:
			return;
	}
};

const assetApprovals = () =>
	Promise.resolve().then(() => {
		const assetObj = {
			amount: assetTBalanceOne,
			deposit: balanceOfTwo,
		};
		return rococoRegistry.createType('Option<AssetApproval>', assetObj);
	});

const mockApi = {
	...defaultMockApi,
	query: {
		assets: {
			account: assetsAccount,
			approvals: assetApprovals,
			asset: assetsInfo,
			metadata: assetsMetadata,
		},
	},
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
				[10, 20]
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
				[]
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
				'' // Delegate arg here does not affect the test results
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
