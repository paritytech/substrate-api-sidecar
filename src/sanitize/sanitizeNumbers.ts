import {
	BTreeSet,
	Compact,
	Enum,
	Option,
	// Result,
	Set as CodecSet,
	Struct,
} from '@polkadot/types';
import AbstractArray from '@polkadot/types/codec/AbstractArray';
import AbstractInt from '@polkadot/types/codec/AbstractInt';
import CodecMap from '@polkadot/types/codec/Map';
import StructAny from '@polkadot/types/codec/StructAny';
import { AnyJson, Codec } from '@polkadot/types/types';
import { isObject } from '@polkadot/util';
import * as BN from 'bn.js';
import { InternalServerError } from 'http-errors';


import { isAnyJson, isCodec } from '../is';

/**
 * Forcibly serialize all instances of AbstractInt to base 10.
 *
 * @param value a type that implements polkadot-js Codec
 */
function sanitizeCodec(value: Codec): AnyJson {
	// If objects have an overlapping prototype chain
	// we check lower down the chain first. More specific before less specific.

	if (value instanceof Option) {
		return value.isSome ? sanitizeNumbers(value.unwrap()) : null;
	}

	if (value instanceof Compact) {
		return sanitizeNumbers(value.unwrap());
	}

	// // For the sake of API consistency this is staying out for now
	// if (value instanceof Result) {
	// 	return value.isOk
	// 		? sanitizeNumbers(value.asOk)
	// 		: sanitizeNumbers(value.asError);
	// }

	// Check struct before map because it extends map
	if (value instanceof Struct) {
		return value.defKeys.reduce((jsonStruct, key) => {
			const property = value.get(key);
			if (!property) {
				return jsonStruct;
			}
			jsonStruct[key] = sanitizeNumbers(property);
			return jsonStruct;
		}, {} as Record<string, AnyJson>);
	}

	if (value instanceof StructAny) {
		// This is essentially a Map with [keys: strings]: any
		const jsonStructAny: Record<string, AnyJson> = {};
		value.forEach((element, prop) => {
			jsonStructAny[prop] = sanitizeNumbers(element);
		});
		return jsonStructAny;
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return { [value.type]: sanitizeNumbers(value.value) };
	}

	if (value instanceof BTreeSet) {
		const jsonSet: AnyJson[] = [];

		value.forEach((element: Codec) => {
			jsonSet.push(sanitizeNumbers(element));
		});

		return jsonSet;
	}

	if (value instanceof CodecSet) {
		// CodecSet is essentially just a JS Set<string>
		return value.strings;
	}

	// Should cover BTreeMap and HashMap
	if (value instanceof CodecMap) {
		return mapTypeSanitizeKeyValue(value);
	}

	// Should cover Vec, VecAny, VecFixed, Tuple
	if (value instanceof AbstractArray) {
		return value.map(sanitizeNumbers);
	}

	// Should cover Uint and Int
	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	// All other codecs are not nested
	return value.toJSON();
}

/**
 * Forcibly serialize all instances of AbstractInt to base 10 and otherwise
 * normalize data presentation to AnyJson. Under the hood AbstractInto is
 * a BN.js, which has a .toString(radix) that lets us convert to base 10.
 * The likely reason for the inconsistency in polkadot-js natives .toJSON
 * is that over a certain value many Int like types have a flag that tells
 * them to serialize to Hex.
 *
 * @param data - pretty much anything that Sidecar might send
 */
export function sanitizeNumbers(data: unknown): AnyJson {
	if (!data) {
		// All falsy values are valid AnyJson
		return data as AnyJson;
	}

	if (isCodec(data)) {
		return sanitizeCodec(data);
	}

	if (data instanceof Set) {
		const jsonSet = [];

		for (const element of data) {
			jsonSet.push(sanitizeNumbers(element));
		}

		return jsonSet;
	}

	if (data instanceof Map) {
		return mapTypeSanitizeKeyValue(data);
	}

	if (data instanceof BN) {
		return data.toString(10);
	}

	if (Array.isArray(data)) {
		return data.map(sanitizeNumbers);
	}

	// Pretty much everything is an object so we need to check this last

	if (isObject(data)) {
		return Object.entries(data).reduce((sanitizedObject, [key, value]) => {
			sanitizedObject[key] = sanitizeNumbers(value);
			return sanitizedObject;
		}, {} as { [prop: string]: AnyJson });
	}

	// TODO After some sustained testing, it makes sense to remove this
	// since it is expensive
	if (!isAnyJson(data)) {
		console.error('data could not be forced to `AnyJson` `sanitizeNumber`');
		console.error(data);
	}

	// If we have gotten to here than it is not a Codec, Array or Object
	// so likely it is string, number, boolean, null, or undefined
	return data as AnyJson;
}

/**
 * Sanitize both the key and values of a map based type, ensuring that the key
 * is either a number or string.
 *
 * @param map Map | CodecMap
 */
function mapTypeSanitizeKeyValue(map: Map<unknown, unknown> | CodecMap) {
	const jsonMap: AnyJson = {};

	map.forEach((value: unknown, key: unknown) => {
		const nonCodecKey = sanitizeNumbers(key);
		if (
			!(
				typeof nonCodecKey === 'string' ||
				typeof nonCodecKey === 'number'
			)
		) {
			throw new InternalServerError(
				'Unexpected non-string and non-number key while sanitizing a CodecMap'
			);
		}

		jsonMap[nonCodecKey] = sanitizeNumbers(value);
	});

	return jsonMap;
}
