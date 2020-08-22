import { Call } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types/codec';
import { stringCamelCase } from '@polkadot/util';

import { decoratedKusamaMetadata } from './metadata/decorated';

type CallArgValues = string | number | Codec | Call | CallArgValues[];

type CallArgs = { [i: string]: CallArgValues | CallArgs };

/**
 * Create a polkadot-js Call using decorated metadata. Useful for testing that
 * needs a Call.
 *
 * TODO: This should be switched to polkadotRegistry as we will phase out kusamaRegisty.
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
