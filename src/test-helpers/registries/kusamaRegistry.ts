import { Metadata } from '@polkadot/metadata';
import substrateMetadataRpc from '@polkadot/metadata/v11/static';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 *
 * N.B. This should deprecated since it does not set chain properties.
 * It is still here because it has users.
 */
function createKusamaRegistry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Kusama', 'kusama', 2008));

	registry.setMetadata(new Metadata(registry, substrateMetadataRpc));

	return registry;
}

/**
 * Kusama v2008 TypeRegistry.
 */
export const kusamaRegistry = createKusamaRegistry();
