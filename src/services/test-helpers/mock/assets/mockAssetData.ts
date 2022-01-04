import {
	AssetApproval,
	AssetDetails,
	AssetId,
	AssetMetadata,
} from '@polkadot/types/interfaces';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec/base';

import { statemintV1 } from '../../../../test-helpers/metadata/statemintMetadata';
import { rococoRegistry } from '../../../../test-helpers/registries';
import { createApiWithAugmentations } from '../../../../test-helpers/typeFactory';
import { TypeFactory } from '../../../../test-helpers/typeFactory';

/**
 * This mock data uses Statemint specVersion 1
 */
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
	'10': assetBalanceObjOne as unknown as PalletAssetsAssetAccount,
	'20': assetBalanceObjTwo as unknown as PalletAssetsAssetAccount,
	'30': assetBalanceObjThree as unknown as PalletAssetsAssetAccount,
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

export const assetsInfo = (): Promise<AssetDetails> =>
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

export const assetsInfoKeysInjected = (): (() => Promise<AssetDetails>) => {
	// Create a shallow copy of assetsInfo
	const assetInfoCopy = Object.assign({}, assetsInfo);

	// Inject the keys into `assetsInfoCopy`
	Object.assign(assetInfoCopy, {
		keys: assetsAccountKeysAt,
	});

	return assetInfoCopy;
};

export const assetsMetadata = (): Promise<AssetMetadata> =>
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

/**
 * @param assetId options are 10, 20, 30
 */
export const assetsAccount = (
	assetId: number | AssetId,
	_address: string
): PalletAssetsAssetAccount | undefined => {
	const id =
		typeof assetId === 'number' ? assetId : parseInt(assetId.toString());

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

export const assetApprovals = (): Promise<Option<AssetApproval>> =>
	Promise.resolve().then(() => {
		const assetObj = {
			amount: assetTBalanceOne,
			deposit: balanceOfTwo,
		};
		return rococoRegistry.createType('Option<AssetApproval>', assetObj);
	});
