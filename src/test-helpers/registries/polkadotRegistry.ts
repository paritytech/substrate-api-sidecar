import { Metadata } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

import { polkadotMetadataRpcV16 } from '../metadata/polkadotV16Metadata';
import { polkadotMetadataRpcV29 } from '../metadata/polkadotV29Metadata';
import { polkadotMetadataRpcV9110 } from '../metadata/polkadotV9110Metadata';
import { polkadotMetadataRpcV9122 } from '../metadata/polkadotV9122Metadata';

/**
 * Create a type registry for Polkadot.
 * Useful for creating types in order to facilitate testing.
 */
function createPolkadotRegistry(
	specVersion: number,
	metadata: `0x${string}`
): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(
		getSpecTypes(registry, 'Polkadot', 'polkadot', specVersion)
	);
	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 0,
			tokenDecimals: 12,
			tokenSymbol: 'DOT',
		})
	);

	registry.setMetadata(new Metadata(registry, metadata));

	return registry;
}

/**
 * Polkadot v16 TypeRegistry.
 */
export const polkadotRegistry = createPolkadotRegistry(
	16,
	polkadotMetadataRpcV16
);

/**
 * Polkadot v29 TypeRegistry
 */

export const polkadotRegistryV29 = createPolkadotRegistry(
	29,
	polkadotMetadataRpcV29
);

/**
 * Polkadot v9110 TypeRegistry
 */
export const polkadotRegistryV9110 = createPolkadotRegistry(
	9110,
	polkadotMetadataRpcV9110
);

/**
 * Polkadot v9122 TypeRegistry
 */
export const polkadotRegistryV9122 = createPolkadotRegistry(
	9122,
	polkadotMetadataRpcV9122
);
