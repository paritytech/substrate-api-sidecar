// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { AssetMetadata } from '@polkadot/types/interfaces';
import { PalletAssetsAssetDetails } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec/base';

import { assetHubKusamaRegistryV9430 } from '../../../../test-helpers/registries';

/**
 * This mock data uses Asset Hub Kusama specVersion V9430
 */
const trueBool = assetHubKusamaRegistryV9430.createType('bool', true);
const falseBool = assetHubKusamaRegistryV9430.createType('bool', false);

const accountIdTknr = assetHubKusamaRegistryV9430.createType(
	'AccountId',
	'FBeL7DiQ6JkoypYATheXhH3GQr5de2L3hL444TP6qQr3yA9',
);
const balanceOfTknr = assetHubKusamaRegistryV9430.createType('BalanceOf', 6693666633);

const accountIdDot = assetHubKusamaRegistryV9430.createType(
	'AccountId',
	'FxqimVubBRPqJ8kTwb3wL7G4q645hEkBEnXPyttLsTrFc5Q',
);
// TODO: balanceOfDot needs to be updated as soon as DOT Metadata
// in Kusama Asset Hub are updated with the right values.
const balanceOfDot = assetHubKusamaRegistryV9430.createType('BalanceOf', 0);

const foreignAssetInfoDot = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdDot,
		issuer: accountIdDot,
		admin: accountIdDot,
		freezer: accountIdDot,
		supply: assetHubKusamaRegistryV9430.createType('u64', 0),
		deposit: assetHubKusamaRegistryV9430.createType('BalanceOf', 0),
		minBalance: assetHubKusamaRegistryV9430.createType('u64', 100000000),
		isSufficient: trueBool,
		accounts: assetHubKusamaRegistryV9430.createType('u8', 0),
		sufficients: assetHubKusamaRegistryV9430.createType('u8', 0),
		approvals: assetHubKusamaRegistryV9430.createType('u8', 0),
		status: 'Live',
	};

	return assetHubKusamaRegistryV9430.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

const foreignAssetInfoTknr = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountIdTknr,
		issuer: accountIdTknr,
		admin: accountIdTknr,
		freezer: accountIdTknr,
		supply: assetHubKusamaRegistryV9430.createType('u64', 0),
		deposit: assetHubKusamaRegistryV9430.createType('BalanceOf', 100000000000),
		minBalance: assetHubKusamaRegistryV9430.createType('u64', 1000000000),
		isSufficient: falseBool,
		accounts: assetHubKusamaRegistryV9430.createType('u8', 0),
		sufficients: assetHubKusamaRegistryV9430.createType('u8', 0),
		approvals: assetHubKusamaRegistryV9430.createType('u8', 0),
		status: 'Live',
	};

	return assetHubKusamaRegistryV9430.createType('Option<PalletAssetsAssetDetails>', responseObj);
};

export const foreignAssetsInfo = [foreignAssetInfoDot, foreignAssetInfoTknr];

// TODO: The values in foreignAssetMetadataDot need to be updated
// as soon as the Metadata of Polkadot are correctly updated in Kusama Asset Hub.
// Right now Polkadot does not have metadata due to an error.
const foreignAssetMetadataDot = (): AssetMetadata => {
	const responseObj = {
		deposit: balanceOfDot,
		name: assetHubKusamaRegistryV9430.createType('Bytes', 'Polkadot'),
		symbol: assetHubKusamaRegistryV9430.createType('Bytes', 'DOT'),
		decimals: assetHubKusamaRegistryV9430.createType('u8', 10),
		isFrozen: falseBool,
	};

	return assetHubKusamaRegistryV9430.createType('AssetMetadata', responseObj);
};

const foreignAssetMetadataTknr = (): AssetMetadata => {
	const responseObj = {
		deposit: balanceOfTknr,
		name: assetHubKusamaRegistryV9430.createType('Bytes', 'Tinkernet'),
		symbol: assetHubKusamaRegistryV9430.createType('Bytes', 'TNKR'),
		decimals: assetHubKusamaRegistryV9430.createType('u8', 12),
		isFrozen: falseBool,
	};

	return assetHubKusamaRegistryV9430.createType('AssetMetadata', responseObj);
};

export const foreignAssetsMetadata = (location: string): AssetMetadata => {
	const foreignAssetMultiLocationStr = JSON.stringify(location).replace(/(\d),/g, '$1');

	if (foreignAssetMultiLocationStr == '{"parents":"2","interior":{"X1":{"GlobalConsensus":"Polkadot"}}}')
		return foreignAssetMetadataDot();
	else {
		return foreignAssetMetadataTknr();
	}
};
