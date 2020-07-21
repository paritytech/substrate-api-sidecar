import Decorated from '@polkadot/metadata/Decorated';
import metadataRpc from '@polkadot/metadata/Metadata/v11/static';
import { Metadata, TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { Call } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types/codec';
import { stringCamelCase } from '@polkadot/util';

/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 */
function createKusamaRegistry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Kusama', 'kusama', 2008));

	registry.createType('ChainProperties', {
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
	});

	registry.setMetadata(new Metadata(registry, metadataRpc));

	return registry;
}

export const kusamaRegistry = createKusamaRegistry();

/**
 * Decorated metadata of the kusamaRegistry
 */
const decoratedMetadata = new Decorated(
	kusamaRegistry,
	new Metadata(kusamaRegistry, metadataRpc)
);

type CallArgs = {
	[i: string]: string | number | Codec | Call | CallArgs[] | CallArgs;
};

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
	const call = decoratedMetadata.tx[pallet][method];

	return call(
		// Map over arguments to call and key into the users args to get the values
		// We are making the assumption that meta.args will have correct ordering
		...call.meta.args.map((arg) => {
			return args[stringCamelCase(arg.name.toString())];
		})
	);
}
