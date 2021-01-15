import { Metadata } from '@polkadot/metadata';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

import { polkadotV16MetadataRpc } from '../metadata/polkadotV16Metadata';
import { polkadotV27MetadataRpc } from '../metadata/polkadotV27Metadata';

/**
 * Create a type registry for Polkadot.
 * Useful for creating types in order to facilitate testing.
 */
function createPolkadotRegistry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Polkadot', 'polkadot', 16));
	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 0,
			tokenDecimals: 12,
			tokenSymbol: 'DOT',
		})
	);

	registry.setMetadata(new Metadata(registry, polkadotV16MetadataRpc));

	return registry;
}

/**
 * Polkadot v16 TypeRegistry.
 */
export const polkadotRegistry = createPolkadotRegistry();

/**
 * Create a type registry for Polkadot v27.
 * Useful for creating types in order to facilitate testing.
 */
function createPolkadotV27Registry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Polkadot', 'polkadot', 27));
	registry.setChainProperties(
		registry.createType('ChainProperties', {
			ss58Format: 0,
			tokenDecimals: 10,
			tokenSymbol: 'DOT',
		})
	);

	registry.setMetadata(new Metadata(registry, polkadotV27MetadataRpc));

	return registry;
}

/**
 * Polkadot v27 TypeRegistry. First runtime version that uses `consts.system.blockWeights`
 * instead of `consts.system.extrinsicBaseWeight`.
 */
export const polkadotV27Registry = createPolkadotV27Registry();
