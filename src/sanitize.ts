import { Option, Result, Struct } from '@polkadot/types';
import AbstractInt from '@polkadot/types/codec/AbstractInt';
import { AnyJson, Codec } from '@polkadot/types/types';

/**
 *
 * Check
 * Option, Tuple, Vec, Struct, Result, Enum, (Map, Set, Int)
 */

export function sanitizeCodec(value: Codec): AnyJson {
	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	// Check option and result before enum because they extend enum
	if (value instanceof Option) {
		return value.isSome ? sanitizeCodec(value.unwrap()) : null;
	}

	if (value instanceof Result) {
		if (value.isEmpty) {
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

	return 'stub';
}
