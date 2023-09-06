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

import {
	AssetApproval,
	AssetDetails,
	AssetId,
	AssetMetadata,
} from '@polkadot/types/interfaces';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec/base';

import { assetHubPolkadotV1 } from '../../../../test-helpers/metadata/assetHubPolkadotMetadata';
import { rococoRegistry } from '../../../../test-helpers/registries';
import { createApiWithAugmentations } from '../../../../test-helpers/typeFactory';
import { TypeFactory } from '../../../../test-helpers/typeFactory';

/**
 * This mock data uses Asset Hub Polkadot specVersion 1
 */
const assetHubPolkadotApiV1 = createApiWithAugmentations(assetHubPolkadotV1);
const assetHubPolkadotTypeFactory = new TypeFactory(assetHubPolkadotApiV1);

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

const assetStorageKeyOne = assetHubPolkadotTypeFactory.storageKey(
	10,
	'AssetId',
	assetHubPolkadotApiV1.query.assets.asset
);

const assetStorageKeyTwo = assetHubPolkadotTypeFactory.storageKey(
	20,
	'AssetId',
	assetHubPolkadotApiV1.query.assets.asset
);

const assetStorageKeyThree = assetHubPolkadotTypeFactory.storageKey(
	30,
	'AssetId',
	assetHubPolkadotApiV1.query.assets.asset
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
