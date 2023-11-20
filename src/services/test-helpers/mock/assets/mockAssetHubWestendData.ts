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

import { AssetApproval, AssetId, AssetMetadata } from '@polkadot/types/interfaces';
import { PalletAssetsAssetAccount, PalletAssetsAssetDetails } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec/base';

import { assetHubWestendMetadataRpcV9435 } from '../../../../test-helpers/metadata/assetHubWestendMetadata';
import { assetHubWestendRegistryV9435 } from '../../../../test-helpers/registries';
import { createApiWithAugmentations } from '../../../../test-helpers/typeFactory';
import { TypeFactory } from '../../../../test-helpers/typeFactory';

/**
 * This mock data uses Asset Hub Westend specVersion 1
 */
const assetHubWestendApi = createApiWithAugmentations(assetHubWestendMetadataRpcV9435);
const assetHubWestendTypeFactory = new TypeFactory(assetHubWestendApi);

const falseBool = assetHubWestendRegistryV9435.createType('bool', false);
const trueBool = assetHubWestendRegistryV9435.createType('bool', true);
const assetTBalanceOne = assetHubWestendRegistryV9435.createType('u64', 147648230602234);
const assetTBalanceTwo = assetHubWestendRegistryV9435.createType('u64', 100);
const assetTBalanceThree = assetHubWestendRegistryV9435.createType('u64', 200000);

const accountIdTwo = assetHubWestendRegistryV9435.createType(
	'AccountId',
	'5D8Rj3PcZaTDETw2tK67APJVXEubgo7du83kaFXvju3ASToj',
);
const balanceOfOne = assetHubWestendRegistryV9435.createType('BalanceOf', 2000000);
const balanceOfTwo = assetHubWestendRegistryV9435.createType('BalanceOf', 48989794);

const assetBalanceObjOne = {
	balance: assetTBalanceOne,
	isFrozen: 'isFrozen does not exist for this runtime',
	sufficient: falseBool,
};

const assetBalanceObjTwo = {
	balance: assetTBalanceTwo,
	isFrozen: 'isFrozen does not exist for this runtime',
	sufficient: falseBool,
};

const assetBalanceObjThree = {
	balance: assetTBalanceThree,
	isFrozen: trueBool,
	sufficient: falseBool,
};

const assetBalanceFactory = {
	'0': assetBalanceObjOne as unknown as PalletAssetsAssetAccount,
	'21': assetBalanceObjTwo as unknown as PalletAssetsAssetAccount,
	'29': assetBalanceObjThree as unknown as PalletAssetsAssetAccount,
};

const assetStorageKeyOne = assetHubWestendTypeFactory.storageKey(0, 'AssetId', assetHubWestendApi.query.assets.asset);

const assetStorageKeyTwo = assetHubWestendTypeFactory.storageKey(21, 'AssetId', assetHubWestendApi.query.assets.asset);

const assetStorageKeyThree = assetHubWestendTypeFactory.storageKey(
	29,
	'AssetId',
	assetHubWestendApi.query.assets.asset,
);

const assetsAccountKeysAt = () =>
	Promise.resolve().then(() => {
		return [assetStorageKeyOne, assetStorageKeyTwo, assetStorageKeyThree];
	});

export const poolAssetsInfo = (): Promise<PalletAssetsAssetDetails> =>
	Promise.resolve().then(() => {
		const responseObj = {
			owner: accountIdTwo,
			issuer: accountIdTwo,
			admin: accountIdTwo,
			freezer: accountIdTwo,
			supply: balanceOfTwo,
			deposit: assetHubWestendRegistryV9435.createType('u32', 0),
			minBalance: assetHubWestendRegistryV9435.createType('u32', 1),
			isSufficient: falseBool,
			accounts: assetHubWestendRegistryV9435.createType('u32', 2),
			sufficients: assetHubWestendRegistryV9435.createType('u32', 0),
			approvals: assetHubWestendRegistryV9435.createType('u32', 0),
			status: 'Live',
		};

		return assetHubWestendRegistryV9435.createType('PalletAssetsAssetDetails', responseObj);
	});

export const poolAssetsInfoKeysInjected = (): (() => Promise<PalletAssetsAssetDetails>) => {
	// Create a shallow copy of assetsInfo
	const assetInfoCopy = Object.assign({}, poolAssetsInfo);

	// Inject the keys into `assetsInfoCopy`
	Object.assign(assetInfoCopy, {
		keys: assetsAccountKeysAt,
	});

	return assetInfoCopy;
};

export const poolAssetsMetadata = (): Promise<AssetMetadata> =>
	Promise.resolve().then(() => {
		const responseObj = {
			deposit: assetHubWestendRegistryV9435.createType('u8', 0),
			name: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
			symbol: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
			decimals: assetHubWestendRegistryV9435.createType('u8', 0),
			isFrozen: falseBool,
		};

		return assetHubWestendRegistryV9435.createType('AssetMetadata', responseObj);
	});

/**
 * @param assetId options are 0, 21, 29
 */
export const poolAssetsAccount = (
	assetId: number | AssetId,
	_address: string,
): PalletAssetsAssetAccount | undefined => {
	const id = typeof assetId === 'number' ? assetId : parseInt(assetId.toString());

	switch (id) {
		case 0:
			return assetBalanceFactory[0];
		case 21:
			return assetBalanceFactory[21];
		case 29:
			return assetBalanceFactory[29];
		default:
			return;
	}
};

export const poolAssetApprovals = (): Promise<Option<AssetApproval>> =>
	Promise.resolve().then(() => {
		const assetObj = {
			amount: assetTBalanceOne,
			deposit: balanceOfOne,
		};
		return assetHubWestendRegistryV9435.createType('Option<AssetApproval>', assetObj);
	});
