import {
	BTreeSet,
	Compact,
	Enum,
	Option,
	Result,
	Struct,
} from '@polkadot/types';
import AbstractArray from '@polkadot/types/codec/AbstractArray';
import AbstractInt from '@polkadot/types/codec/AbstractInt';
import CodecMap from '@polkadot/types/codec/Map';
import StructAny from '@polkadot/types/codec/StructAny';
import { AnyJson, Codec } from '@polkadot/types/types';
import { InternalServerError } from 'http-errors';
import { TSidecarResponse } from './types/response_types';
import Constructor from '@polkadot/types/types/codec'

/**
 * Not sure about:
 * - Tuple
 * - Linkage extends Struct
 * - LinkageTuple extends Tuple
 *
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

	// TODO enable check if its a codec
	if (value instanceof StructAny) {
		// const jsonStructAny: Record<string, AnyJson> = {}
		// value.forEach((element, prop) => {
		// 	// if(element insta) {
		// 	// 	// jsonStructAny[prop] = sanitizeCodec(element)
		// 	// } else {
		// 	// 	// jsonStructAny[prop] = sanitizeData(element)
		// 	// }
		// })
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return { [value.type]: sanitizeCodec(value.value) };
	}

	// Note CodecSet not needed bc all values are strings
	if (value instanceof BTreeSet) {
		const jsonSet: AnyJson = [];

		value.forEach((element: Codec) => {
			jsonSet.push(sanitizeCodec(element));
		});

		return jsonSet;
	}

	// Covers BTreeMap and HashMap
	if (value instanceof CodecMap) {
		const jsonMap: AnyJson = {};

		value.forEach((value: Codec, key: Codec) => {
			const sanitizedKey = sanitizeCodec(key);
			if (
				!(
					typeof sanitizedKey === 'string' ||
					typeof sanitizedKey === 'number'
				)
			) {
				throw new InternalServerError(
					'Unexpected non-string and non-number key while sanitizing a CodecMap'
				);
			}

			jsonMap[sanitizedKey] = sanitizeCodec(value);
		});
	}

	if (value instanceof Compact) {
		return sanitizeCodec(value.unwrap());
	}

	if (value instanceof AbstractArray) {
		// Covers Vecs and Tuples
		return value.map((element) => sanitizeCodec(element));
	}

	// Covers Uint and Int
	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	return value.toJSON();
}

export function sanitizeData(data: AnyJson | TSidecarResponse): AnyJson {
	return 'place holder'
}

function isCodec(thing: any): thing is Codec {
	return (thing as Codec).encodedLength && (thing as Codec).hash && (thing as Codec) && (thing as Codec).registry
}