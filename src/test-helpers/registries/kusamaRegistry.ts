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
		})
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
