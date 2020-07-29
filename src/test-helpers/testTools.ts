import Decorated from '@polkadot/metadata/Decorated';
import substrateMetadataRpc from '@polkadot/metadata/Metadata/v11/static';
import { Metadata, TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { Call } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types/codec';
import { stringCamelCase } from '@polkadot/util';

import { polkadotV16MetadataRpc } from './static-metadata/polkadotV16Metadata';
/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 *
 * N.B. This is deprecated since it does not set chain properties.
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
 * Decorated metadata of the kusamaRegistry (v2008).
 */
const decoratedKusamaMetadata = new Decorated(
	kusamaRegistry,
	new Metadata(kusamaRegistry, substrateMetadataRpc)
);

/**
 * Decorated metadata of the polkadotRegistry (v16).
 */
export const decoratedPolkadotMetadata = new Decorated(
	polkadotRegistry,
	new Metadata(polkadotRegistry, polkadotV16MetadataRpc)
);

type CallArgValues = string | number | Codec | Call | CallArgValues[];
type CallArgs = { [i: string]: CallArgValues | CallArgs };

/**
 * Create a polkadot-js Call using decorated metadata. Useful for testing that
 * needs a Call.
 *
 * @param pallet name of pallet in metadata (lowercase)
 * @param method name of method in metadata (lowercase)
 * @param args arguments to call as an object
 */
export function createCall(
	pallet: string,
	method: string,
	args: CallArgs
): Call {
	// Get the call signature
	const call = decoratedKusamaMetadata.tx[pallet][method];

	return call(
		// Map over arguments to call and key into the users args to get the values
		// We are making the assumption that meta.args will have correct ordering
		...call.meta.args.map((arg) => {
			return args[stringCamelCase(arg.name.toString())];
		})
	);
}
