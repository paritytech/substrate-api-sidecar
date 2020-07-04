import { Enum, Option, Result, Struct, Vec } from '@polkadot/types';
import AbstractArray from '@polkadot/types/codec/AbstractArray';
import AbstractInt from '@polkadot/types/codec/AbstractInt';
import { AnyJson, Codec } from '@polkadot/types/types';

/**
 *Option, Struct, Result, Abstract Array (Tuple, Vec),  Enum,
 * AbstractInt (Int, UInt)
 * Check
 * 	Set (BTreeSet), Map (BTreeMap)
 *
 */

export function sanitizeCodec(value: Codec): AnyJson {
	// If objects have an overlapping prototype chain
	// we check lower down the chain first. More specific before less specific.

	// Check option and result before enum because they extend enum
	if (value instanceof Option) {
		return value.isSome ? sanitizeCodec(value.unwrap()) : null;
	}

	if (value instanceof Result) {
		// TODO - I am assuming for an empty OK() we just want null - is this correct?
		// We could also do `ok: null`
		if (value.isEmpty || value.isBasic) {
			return null;
		}

		return value.isOk
			? sanitizeCodec(value.asOk)
			: sanitizeCodec(value.asError);
	}

	// Check struct before map because it extends map
	if (value instanceof Struct) {
		return value.defKeys.reduce((jsonStruct, key) => {
			const property = value.get(key);
			if (!property) {
				return jsonStruct;
			}

			jsonStruct[key] = sanitizeCodec(property);
			return jsonStruct;
		}, {} as Record<string, AnyJson>);
	}

	// Covers Vecs and Tuples
	if (value instanceof AbstractArray) {
		return value.map((element) => sanitizeCodec(element));
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return { [value.type]: sanitizeCodec(value.value) };
	}

	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	if (value instanceof Set) {
		return 'stub';
	}

	if (value instanceof Map) {
		return 'stub';
	}

	return value.toJSON();
}
