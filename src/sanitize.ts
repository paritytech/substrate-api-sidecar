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
import { isObject } from '@polkadot/util';
import { InternalServerError } from 'http-errors';

/**
 * Not sure about:
 * - Linkage extends Struct
 * - LinkageTuple extends Tuple
 *
 *
 */
export function sanitizeCodec(value: Codec): AnyJson {
	// If objects have an overlapping prototype chain
	// we check lower down the chain first. More specific before less specific.

	// Check Option and Result before Enum because they extend Enum
	if (value instanceof Option) {
		// Throughout sanitizeCodec we prefer using sanitizeData because the
		// additional type guards within are more robust than calling sanitizeCodec
		return value.isSome ? sanitizeData(value.unwrap()) : null;
	}

	if (value instanceof Result) {
		// TODO - I am assuming for an empty OK() we just want null - is this correct?
		// We could also do `ok: null`
		if (value.isEmpty || value.isBasic) {
			return null;
		}

		return value.isOk
			? sanitizeData(value.asOk)
			: sanitizeData(value.asError);
	}

	// Check struct before map because it extends map
	if (value instanceof Struct) {
		return value.defKeys.reduce((jsonStruct, key) => {
			const property = value.get(key);
			if (!property) {
				return jsonStruct;
			}

			jsonStruct[key] = sanitizeData(property);
			return jsonStruct;
		}, {} as Record<string, AnyJson>);
	}

	if (value instanceof StructAny) {
		// This is essentially a Map with [keys: strings]: any
		const jsonStructAny: Record<string, AnyJson> = {};
		value.forEach((element, prop) => {
			jsonStructAny[prop] = sanitizeData(element);
		});
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return { [value.type]: sanitizeData(value.value) };
	}

	// Note CodecSet case not needed because all values are strings
	if (value instanceof BTreeSet) {
		const jsonSet: AnyJson = [];

		value.forEach((element: Codec) => {
			jsonSet.push(sanitizeData(element));
		});

		return jsonSet;
	}

	// Should cover BTreeMap and HashMap
	if (value instanceof CodecMap) {
		const jsonMap: AnyJson = {};

		// key, value implement Codec
		value.forEach((value: Codec, key: Codec) => {
			const nonCodecKey = sanitizeData(key);
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

			jsonMap[nonCodecKey] = sanitizeData(value);
		});

		return jsonMap;
	}

	if (value instanceof Compact) {
		return sanitizeData(value.unwrap());
	}

	// Should cover Vec, VecAny, VecFixed, Tuple
	if (value instanceof AbstractArray) {
		return value.map(sanitizeData);
	}

	// Should cover Uint and Int
	if (value instanceof AbstractInt) {
		return value.toString(10);
	}

	return value.toJSON();
}

/**
 *
 *
 * TODO change this comment
 * @param data
 */
export function sanitizeData(data: unknown): AnyJson {
	if (!data) {
		// All falsy values are valid AnyJson
		return data as AnyJson;
	}

	if (isCodec(data)) {
		return sanitizeCodec(data);
	}

	if (Array.isArray(data)) {
		return data.map(sanitizeData);
	}

	// Pretty much everything is an object so we need to check this last
	if (isObject(data)) {
		return Object.entries(data).reduce((sanitizedObject, [key, value]) => {
			sanitizedObject[key] = sanitizeData(value);
			return sanitizedObject;
		}, {} as { [prop: string]: AnyJson });
	}

	// I will likely remove this check and just have it in testing since it is expensive
	if (!isAnyJson(data)) {
		console.error('Sanitized data could not be forced to `AnyJson`');
		console.error(data);
		throw new InternalServerError(
			'Sanitized data could not be serialized to `AnyJson`'
		);
	}

	// If we have gotten to here than it is not a Codec, Array or Object
	// so likely it is string, number, boolean, null, or undefined
	return data;
}

function isAnyJson(thing: unknown): thing is AnyJson {
	return (
		thing === null ||
		thing === undefined ||
		typeof thing === 'string' ||
		typeof thing === 'boolean' ||
		typeof thing === 'number' ||
		isArrayAnyJson(thing) ||
		isObjectAnyJson(thing)
	);
}

function isArrayAnyJson(thing: unknown): thing is AnyJson[] {
	if (!(thing && Array.isArray(thing))) {
		return false;
	}

	for (const element of thing) {
		if (!isAnyJson(element)) {
			return false;
		}
	}

	return true;
}

function isObjectAnyJson(thing: unknown): thing is { [i: string]: AnyJson } {
	if (!(thing && isObject(thing))) {
		return false;
	}

	for (const value of Object.values(thing)) {
		if (!isAnyJson(value)) {
			return false;
		}
	}

	return true;
}

function isCodec(thing: unknown): thing is Codec {
	return (
		thing &&
		(thing as Codec).encodedLength !== undefined &&
		(thing as Codec).hash !== undefined &&
		(thing as Codec).registry !== undefined &&
		(thing as Codec).isEmpty !== undefined &&
		typeof (thing as Codec).eq === 'function' &&
		typeof (thing as Codec).toHex === 'function' &&
		typeof (thing as Codec).toHuman === 'function' &&
		typeof (thing as Codec).toJSON === 'function' &&
		typeof (thing as Codec).toRawType === 'function' &&
		typeof (thing as Codec).toString === 'function' &&
		typeof (thing as Codec).toU8a === 'function'
	);
}
