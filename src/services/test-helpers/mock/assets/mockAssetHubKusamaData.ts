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
	PalletAssetsAssetDetails,
	PalletAssetsAssetMetadata,
} from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec/base';

import { assetHubKusamaRegistryV9430 } from '../../../../test-helpers/registries';

/**
 * This mock data uses Asset Hub Kusama specVersion V9430
 */

const falseBool = assetHubKusamaRegistryV9430.createType('bool', false);

const accountId = assetHubKusamaRegistryV9430.createType(
	'AccountId',
	'FBeL7DiQ6JkoypYATheXhH3GQr5de2L3hL444TP6qQr3yA9'
);
const balanceOf = assetHubKusamaRegistryV9430.createType(
	'BalanceOf',
	6693666633
);

export const foreignAssetInfo = (): Option<PalletAssetsAssetDetails> => {
	const responseObj = {
		owner: accountId,
		issuer: accountId,
		admin: accountId,
		freezer: accountId,
		supply: assetHubKusamaRegistryV9430.createType('u64', 0),
		deposit: assetHubKusamaRegistryV9430.createType('BalanceOf', 100000000000),
		minBalance: assetHubKusamaRegistryV9430.createType('u64', 1000000000),
		isSufficient: falseBool,
		accounts: assetHubKusamaRegistryV9430.createType('u8', 0),
		sufficients: assetHubKusamaRegistryV9430.createType('u8', 0),
		approvals: assetHubKusamaRegistryV9430.createType('u8', 0),
		isFrozen: falseBool,
	};

	return assetHubKusamaRegistryV9430.createType(
		'Option<PalletAssetsAssetDetails>',
		responseObj
	);
};

export const foreignAssetMetadata = (): Promise<
	Option<PalletAssetsAssetMetadata>
> =>
	Promise.resolve().then(() => {
		const responseObj = {
			deposit: balanceOf,
			name: assetHubKusamaRegistryV9430.createType('Bytes', 'Tinkernet'),
			symbol: assetHubKusamaRegistryV9430.createType('Bytes', 'TNKR'),
			decimals: assetHubKusamaRegistryV9430.createType('u8', 12),
			isFrozen: falseBool,
		};

		return assetHubKusamaRegistryV9430.createType(
			'Option<PalletAssetsAssetMetadata>',
			responseObj
		);
	});
