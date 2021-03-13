import {
	BTreeSet,
	Compact,
	Enum,
	Option,
	Set as CodecSet,
	Struct,
} from '@polkadot/types';
import { AbstractArray } from '@polkadot/types/codec/AbstractArray';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import { Json } from '@polkadot/types/codec/Json';
import { CodecMap } from '@polkadot/types/codec/Map';
import { isObject, stringCamelCase } from '@polkadot/util';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import {
	AnyJson,
	Codec,
	isAnyJson,
	isCodec,
	isToJSONable,
} from '../types/polkadot-js';

/**
 * Forcibly serialize all instances of AbstractInt to base 10. With Codec
 * based types we can provide a strong guarantee that the output will be of AnyJson
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

	if (value instanceof Json) {
		// This is essentially a Map with [keys: strings]: any
		const json: Record<string, AnyJson> = {};
		value.forEach((element, prop) => {
			json[prop] = sanitizeNumbers(element);
		});

		return json;
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return {
			// Replicating camelCaseing introduced in https://github.com/polkadot-js/api/pull/3024
			// Specifically see: https://github.com/polkadot-js/api/blob/516fbd4a90652841d4e81636e74ca472e2dc5621/packages/types/src/codec/Enum.ts#L346
			[stringCamelCase(value.type)]: sanitizeNumbers(value.value),
		};
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

	// Should cover Uint, Int etc...
	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	// All other codecs are not nested
	return value.toJSON();
}

/**
 * Forcibly serialize all instances of AbstractInt to base 10 and otherwise
 * normalize data presentation. We try to guarantee that data is
 * of type AnyJson, but it is not a strong guarantee.
 *
 * Under the hood AbstractInt is
 * a BN.js, which has a .toString(radix) that lets us convert to base 10.
 * The likely reason for the inconsistency in polkadot-js natives .toJSON
 * is that over a certain value some Int like types have a flag that tells
 * them to serialize to Hex.
 *
 * @param data - any arbitrary data that Sidecar might send
 */
export function sanitizeNumbers(data: unknown): AnyJson {
	if (data !== 0 && !data) {
		// All falsy values are valid AnyJson, but we want to force numbers to strings
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

	if (data instanceof BN || typeof data === 'number') {
		return data.toString(10);
	}

	if (Array.isArray(data)) {
		return data.map(sanitizeNumbers);
	}

	if (isToJSONable(data)) {
		// Handle non-codec types that have their own toJSON
		return sanitizeNumbers(data.toJSON());
	}

	// Pretty much everything non-primitive is an object, so we need to check this last
	if (isObject(data)) {
		return Object.entries(data).reduce((sanitizedObject, [key, value]) => {
			sanitizedObject[key] = sanitizeNumbers(value);

			return sanitizedObject;
		}, {} as { [prop: string]: AnyJson });
	}

	if (!isAnyJson(data)) {
		// TODO this may be removed in the future
		console.error('data could not be forced to `AnyJson` `sanitizeNumber`');
		console.error(data);
	}

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
				'Unexpected non-string and non-number key while sanitizing a Map-like type'
			);
		}

		jsonMap[nonCodecKey] = sanitizeNumbers(value);
	});

	return jsonMap;
}
