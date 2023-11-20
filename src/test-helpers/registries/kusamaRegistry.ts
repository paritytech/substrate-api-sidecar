// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { kusamaMetadataV2008 } from '../metadata/kusamaV2008Metadata';

/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 *
 * N.B. This should deprecated since it does not set chain properties.
 * It is still here because it has users.
 */
function createKusamaRegistryDeprecated(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Kusama', 'kusama', 2008));

	registry.setMetadata(new Metadata(registry, kusamaMetadataV2008));

	return registry;
}

/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 *
 * @param specVersion Kusama runtime spec version to get type defs for.
 */
function createKusamaRegistry(specVersion: number): TypeRegistry {
	const registry = new TypeRegistry();

	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 2,
			tokenDecimals: 12,
			tokenSymbol: 'KSM',
		}),
	);

	registry.register(getSpecTypes(registry, 'Kusama', 'kusama', specVersion));

	registry.setMetadata(new Metadata(registry, kusamaMetadataV2008));

	return registry;
}

/**
 * Kusama v2008 TypeRegistry.
 */
export const kusamaRegistry = createKusamaRegistryDeprecated();

/**
 *  Kusama v2025 TypeRegistry.
 */
export const kusamRegistryV2025 = createKusamaRegistry(2025);
