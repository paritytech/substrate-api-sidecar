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

import { polkadotMetadataRpcV16 } from '../metadata/polkadotV16Metadata';
import { polkadotMetadataRpcV29 } from '../metadata/polkadotV29Metadata';
import { polkadotMetadataRpcV9110 } from '../metadata/polkadotV9110Metadata';
import { polkadotMetadataRpcV9122 } from '../metadata/polkadotV9122Metadata';
import { polkadotMetadataRpcV9190 } from '../metadata/polkadotV9190Metadata';
import { polkadotMetadataRpcV9300 } from '../metadata/polkadotV9300Metadata';
import { polkadotMetadataRpcV9370 } from '../metadata/polkadotV9370Metadata';
import { polkadotMetadataRpcV1000001 } from '../metadata/polkadotV1000001Metadata';
/**
 * Create a type registry for Polkadot.
 * Useful for creating types in order to facilitate testing.
 */
function createPolkadotRegistry(specVersion: number, metadata: `0x${string}`): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Polkadot', 'polkadot', specVersion));
	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 0,
			tokenDecimals: 12,
			tokenSymbol: 'DOT',
		}),
	);

	registry.setMetadata(new Metadata(registry, metadata));

	return registry;
}

/**
 * Polkadot v16 TypeRegistry.
 */
export const polkadotRegistry = createPolkadotRegistry(16, polkadotMetadataRpcV16);

/**
 * Polkadot v29 TypeRegistry
 */

export const polkadotRegistryV29 = createPolkadotRegistry(29, polkadotMetadataRpcV29);

/**
 * Polkadot v9110 TypeRegistry
 */
export const polkadotRegistryV9110 = createPolkadotRegistry(9110, polkadotMetadataRpcV9110);

/**
 * Polkadot v9122 TypeRegistry
 */
export const polkadotRegistryV9122 = createPolkadotRegistry(9122, polkadotMetadataRpcV9122);

/**
 * Polkadot v9190 TypeRegistry
 */
export const polkadotRegistryV9190 = createPolkadotRegistry(9190, polkadotMetadataRpcV9190);

/**
 * Polkadot v9300 TypeRegistry
 */
export const polkadotRegistryV9300 = createPolkadotRegistry(9300, polkadotMetadataRpcV9300);

export const polkadotRegistryV9370 = createPolkadotRegistry(9370, polkadotMetadataRpcV9370);

/**
 * Polkadot v1000001 TypeRegistry
 */
export const polkadotRegistryV1000001 = createPolkadotRegistry(1000001, polkadotMetadataRpcV1000001);
