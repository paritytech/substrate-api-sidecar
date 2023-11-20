// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { BTreeSet, Compact, Enum, Option, Set as CodecSet, Struct } from '@polkadot/types';
import { AbstractArray, AbstractInt, Bytes, CodecMap, Json } from '@polkadot/types-codec';
import { hexToU8a, isHex, isObject, stringCamelCase, u8aToBn } from '@polkadot/util';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import { AnyJson, Codec, isAnyJson, isCodec, isToJSONable } from '../types/polkadot-js';
import { IMetadataOptions, ISanitizeOptions } from '../types/sanitize';

/**
 * Forcibly serialize all instances of AbstractInt to base 10. With Codec
 * based types we can provide a strong guarantee that the output will be of AnyJson
 *
 * @param value a type that implements polkadot-js Codec
 * @param options - set of options specific to sanitization
 */
function sanitizeCodec(value: Codec, options: ISanitizeOptions = {}): AnyJson {
	// If objects have an overlapping prototype chain
	// we check lower down the chain first. More specific before less specific.

	if (value instanceof Option) {
		return value.isSome ? sanitizeNumbers(value.unwrap(), options) : null;
	}

	if (value instanceof Compact) {
		return sanitizeNumbers(value.unwrap(), options);
	}

	if (value instanceof Struct) {
		return value.defKeys.reduce(
			(jsonStruct, key) => {
				const property = value.get(key);

				if (!property) {
					return jsonStruct;
				}

				jsonStruct[key] = sanitizeNumbers(property, options);

				/**
				 * If the data we are sanitizing is metadata, ex: `/runtime/metadata`,
				 * we want to sanitize all exceptions that arent caught using `sanitizeNumbers`
				 */
				if (options?.metadataOpts) {
					sanitizeMetadataExceptions(key, jsonStruct, property, options.metadataOpts);
				}

				return jsonStruct;
			},
			{} as Record<string, AnyJson>,
		);
	}

	if (value instanceof Json) {
		// This is essentially a Map with [keys: strings]: any
		const json: Record<string, AnyJson> = {};
		value.forEach((element, prop) => {
			json[prop] = sanitizeNumbers(element, options);
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
			[stringCamelCase(value.type)]: sanitizeNumbers(value.value, options),
		};
	}

	if (value instanceof BTreeSet) {
		const jsonSet: AnyJson[] = [];

		value.forEach((element: Codec) => {
			jsonSet.push(sanitizeNumbers(element, options));
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
		return value.map((val) => sanitizeNumbers(val, options));
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
 * @param options - set of options specific to sanitization
 */
export function sanitizeNumbers(data: unknown, options: ISanitizeOptions = {}): AnyJson {
	if (data !== 0 && !data) {
		// All falsy values are valid AnyJson, but we want to force numbers to strings
		return data as AnyJson;
	}

	if (isCodec(data)) {
		return sanitizeCodec(data, options);
	}

	if (data instanceof Set) {
		const jsonSet = [];

		for (const element of data) {
			jsonSet.push(sanitizeNumbers(element, options));
		}

		return jsonSet;
	}

	if (data instanceof Map) {
		return mapTypeSanitizeKeyValue(data, options);
	}

	if (data instanceof BN || typeof data === 'number') {
		return data.toString(10);
	}

	if (Array.isArray(data)) {
		return data.map((val) => sanitizeNumbers(val, options));
	}

	if (isToJSONable(data)) {
		// Handle non-codec types that have their own toJSON
		return sanitizeNumbers(data.toJSON(), options);
	}

	// Pretty much everything non-primitive is an object, so we need to check this last
	if (isObject(data)) {
		return Object.entries(data).reduce(
			(sanitizedObject, [key, value]) => {
				sanitizedObject[key] = sanitizeNumbers(value, options);

				return sanitizedObject;
			},
			{} as { [prop: string]: AnyJson },
		);
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
 * @param options - set of options specific to sanitization
 */
function mapTypeSanitizeKeyValue(map: Map<unknown, unknown> | CodecMap, options: ISanitizeOptions = {}) {
	const jsonMap: AnyJson = {};

	map.forEach((value: unknown, key: unknown) => {
		let nonCodecKey = sanitizeNumbers(key, options);
		if (typeof nonCodecKey === 'object') {
			nonCodecKey = JSON.stringify(nonCodecKey);
		}
		if (!(typeof nonCodecKey === 'string' || typeof nonCodecKey === 'number')) {
			throw new InternalServerError('Unexpected non-string and non-number key while sanitizing a Map-like type');
		}

		jsonMap[nonCodecKey] = sanitizeNumbers(value, options);
	});

	return jsonMap;
}

/**
 * Based on the metadata version, we ensure arbitrary exceptions are sanitized
 * properly.
 *
 * @param key Current key of an object
 * @param struct Current struct being sanitized
 * @param property Current value of the inputted key
 * @param metadataOpts metadata specific options
 */
function sanitizeMetadataExceptions(
	key: string,
	struct: Record<string, AnyJson>,
	property: Codec,
	metadataOpts: IMetadataOptions,
): void {
	switch (metadataOpts.version) {
		case 14:
			sanitizeMetadataExceptionsV14(key, struct, property, metadataOpts);
			break;
		default:
			break;
	}
}

/**
 * When v14 metadata is being sanitized, we ensure arbitrary exceptions are sanitized
 * properly.
 *
 * @param key Current key of an object
 * @param struct Current struct being sanitized
 * @param property Current value of the inputted key
 * @param metadataOpts metadata specific options
 */
function sanitizeMetadataExceptionsV14(
	key: string,
	struct: Record<string, AnyJson>,
	property: Codec,
	metadataOpts: IMetadataOptions,
) {
	const { registry } = metadataOpts;
	const integerTypes = ['u128', 'u64', 'u32', 'u16', 'u8'];
	const value = struct[key];
	/**
	 * With V14 metadata the only key that is named 'value' lives inside of the
	 * pallets key. The expected structure containing `{ type, value }`.
	 */
	if (key === 'value' && property instanceof Bytes && isHex(value)) {
		const u8aValue = hexToU8a(value);
		/**
		 * Get the lookup typedef. It is safe to assume that we have the struct
		 * `type` field when `key === value` is true.
		 */
		const typeDef = registry.lookup.getTypeDef(parseFloat(struct.type as string));
		/**
		 * Checks u128, u64, u32, u16, u8
		 */
		if (integerTypes.includes(typeDef.type)) {
			struct[key] = u8aToBn(u8aValue.subarray(0, u8aValue.byteLength), {
				isLe: true,
			}).toString(10);
		}
		/**
		 * The value is not an integer, and needs to be converted to its
		 * correct type, then transformed to JSON.
		 */
		if (isHex(struct[key]) && (typeDef.lookupName || typeDef.type)) {
			const typeName = typeDef.lookupName || typeDef.type;

			struct[key] = sanitizeNumbers(registry.createType(typeName, u8aValue).toJSON(), { metadataOpts });
		}
	}
}
