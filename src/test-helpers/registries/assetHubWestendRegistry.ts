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

import { Metadata } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

import { assetHubWestendMetadataRpcV9435 } from '../metadata/assetHubWestendMetadata';

/**
 * Create a type registry for Asset Hub Westend.
 * Useful for creating types in order to facilitate testing.
 */
function createAssetHubWestendRegistry(specVersion: number, metadata: `0x${string}`): TypeRegistry {
	const registry = new TypeRegistry();
	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 42,
			tokenDecimals: 12,
			tokenSymbol: 'WND',
		}),
	);

	registry.register(getSpecTypes(registry, 'Westend Asset Hub', 'westmint', specVersion));

	registry.setMetadata(new Metadata(registry, metadata));

	return registry;
}

/**
 * Asset Hub Westend v9435 TypeRegistry.
 */
export const assetHubWestendRegistryV9435 = createAssetHubWestendRegistry(9435, assetHubWestendMetadataRpcV9435);
