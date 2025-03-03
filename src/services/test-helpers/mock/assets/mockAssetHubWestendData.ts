// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

/**
 * This mock data uses Asset Hub Westend specVersion V9435
 */

const accountIdWAH1 = assetHubWestendRegistryV9435.createType(
	'AccountId',
	'5GjRnmh5o3usSYzVmsxBWzHEpvJyHK4tKNPhjpUR3ASrruBy',
);
const balanceOfTknr = assetHubWestendRegistryV9435.createType('BalanceOf', 6693666633);

const accountIdWAH2 = assetHubWestendRegistryV9435.createType(
	'AccountId',
	'5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY',
);

const accountIdWAH3 = assetHubWestendRegistryV9435.createType(
	'AccountId',
	'5GxRGwT8bU1JeBPTUXc7LEjZMxNrK8MyL2NJnkWFQJTQ4sii',
);

const accountIdWAH4 = assetHubWestendRegistryV9435.createType(
	'AccountId',
	'5Eg2fnsiMxRhMVoAcrXoSYgi9LfB786LKf8yWLA8FPWNYyYD',
);

const foreignAssetInfoWAH0 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH1,
		issuer: accountIdWAH1,
		admin: accountIdWAH1,
		freezer: accountIdWAH1,
		supply: assetHubWestendRegistryV9435.createType('u64', 0),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 15000),
		isSufficient: trueBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 0),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 0),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH1 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH1,
		issuer: accountIdWAH1,
		admin: accountIdWAH1,
		freezer: accountIdWAH1,
		supply: assetHubWestendRegistryV9435.createType('u64', 106000000000000),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 100000000000),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 1),
		isSufficient: falseBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 2),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 0),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH2 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH2,
		issuer: accountIdWAH2,
		admin: accountIdWAH2,
		freezer: accountIdWAH2,
		supply: assetHubWestendRegistryV9435.createType('u64', 0),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 100000000),
		isSufficient: trueBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 1),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 0),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH3 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH3,
		issuer: accountIdWAH3,
		admin: accountIdWAH3,
		freezer: accountIdWAH3,
		supply: assetHubWestendRegistryV9435.createType('u64', 202835530084563),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 10000000000),
		isSufficient: trueBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 14),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 11),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH4 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH1,
		issuer: accountIdWAH1,
		admin: accountIdWAH1,
		freezer: accountIdWAH1,
		supply: assetHubWestendRegistryV9435.createType('u64', 998000000000),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 15000),
		isSufficient: trueBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 1),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 1),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH5 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH1,
		issuer: accountIdWAH1,
		admin: accountIdWAH1,
		freezer: accountIdWAH1,
		supply: assetHubWestendRegistryV9435.createType('u64', 0),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 100000000000),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 15000000000000),
		isSufficient: trueBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 3),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 1),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoWAH6 = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdWAH4,
		issuer: accountIdWAH4,
		admin: accountIdWAH4,
		freezer: accountIdWAH4,
		supply: assetHubWestendRegistryV9435.createType('u64', 0),
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 100000000000),
		minBalance: assetHubWestendRegistryV9435.createType('u64', 100000000000000),
		isSufficient: falseBool,
		accounts: assetHubWestendRegistryV9435.createType('u8', 0),
		sufficients: assetHubWestendRegistryV9435.createType('u8', 0),
		approvals: assetHubWestendRegistryV9435.createType('u8', 0),
		status: 'Live',
	};

	return assetHubWestendRegistryV9435.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

export const foreignAssetsInfoWestendAH = [
	foreignAssetInfoWAH0,
	foreignAssetInfoWAH1,
	foreignAssetInfoWAH2,
	foreignAssetInfoWAH3,
	foreignAssetInfoWAH4,
	foreignAssetInfoWAH5,
	foreignAssetInfoWAH6,
];

// TODO: The values in foreignAssetMetadataDot need to be updated
// as soon as the Metadata of Polkadot are correctly updated in Kusama Asset Hub.
// Right now Polkadot does not have metadata due to an error.
const foreignAssetMetadataDot = (): AssetMetadata => {
	const responseObj = {
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		name: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
		symbol: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
		decimals: assetHubWestendRegistryV9435.createType('u8', 0),
		isFrozen: falseBool,
	};

	return assetHubWestendRegistryV9435.createType('AssetMetadata', responseObj);
};

const foreignAssetMetadataEth = (): AssetMetadata => {
	const responseObj = {
		deposit: assetHubWestendRegistryV9435.createType('BalanceOf', 0),
		name: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
		symbol: assetHubWestendRegistryV9435.createType('Bytes', '0x'),
		decimals: assetHubWestendRegistryV9435.createType('u8', 0),
		isFrozen: falseBool,
	};

	return assetHubWestendRegistryV9435.createType('AssetMetadata', responseObj);
};

const foreignAssetMetadataRococo = (): AssetMetadata => {
	const responseObj = {
		deposit: balanceOfTknr,
		name: assetHubWestendRegistryV9435.createType('Bytes', 'Rococo'),
		symbol: assetHubWestendRegistryV9435.createType('Bytes', 'ROC'),
		decimals: assetHubWestendRegistryV9435.createType('u8', 12),
		isFrozen: falseBool,
	};

	return assetHubWestendRegistryV9435.createType('AssetMetadata', responseObj);
};

export const foreignAssetsMetadataWestendAH = (location: string): AssetMetadata | string => {
	const foreignAssetMultiLocationStr = JSON.stringify(location).replace(/(\d),/g, '$1');

	if (foreignAssetMultiLocationStr == '0') {
		return location;
	} else if (foreignAssetMultiLocationStr == '{"parents":"2","interior":{"X1":{"GlobalConsensus":"Polkadot"}}}') {
		return foreignAssetMetadataDot();
	} else if (
		foreignAssetMultiLocationStr ==
		'{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}}}}'
	) {
		return foreignAssetMetadataEth();
	} else if (foreignAssetMultiLocationStr == '{"parents":"2","interior":{"X1":{"GlobalConsensus":"__Unused5"}}}') {
		return foreignAssetMetadataRococo();
	} else return foreignAssetMetadataDot();
};
