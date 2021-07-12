import { Metadata } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

import { rococoMetadataV228 } from '../metadata/rococoMetadata';

/**
 * Create a type registry for Rococo.
 * Useful for creating types in order to facilitate testing.
 */
function createRococoRegistry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Rococo', 'rococo', 228));

	registry.setMetadata(new Metadata(registry, rococoMetadataV228));

	return registry;
}

/**
 * Rococo v228 TypeRegistry.
 */
export const rococoRegistry = createRococoRegistry();
