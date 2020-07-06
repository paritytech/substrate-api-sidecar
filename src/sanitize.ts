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
 * - Tuple
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

	if (value instanceof StructAny) {
		// The keys are strings and the values are any
		const jsonStructAny: Record<string, AnyJson> = {};
		value.forEach((element, prop) => {
			if (isCodec(element)) {
				jsonStructAny[prop] = sanitizeCodec(element);
			} else {
				jsonStructAny[prop] = sanitizeData(element);
			}
		});
	}

	if (value instanceof Enum) {
		if (value.isBasic) {
			return value.toJSON();
		}

		return { [value.type]: sanitizeCodec(value.value) };
	}

	// Note CodecSet case not needed because all values are strings
	if (value instanceof BTreeSet) {
		const jsonSet: AnyJson = [];

		value.forEach((element: Codec) => {
			jsonSet.push(sanitizeCodec(element));
		});

		return jsonSet;
	}

	// Should cover BTreeMap and HashMap
	if (value instanceof CodecMap) {
		const jsonMap: AnyJson = {};

		// key, value implement Codec
		value.forEach((value: Codec, key: Codec) => {
			const nonCodecKey = sanitizeCodec(key);
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

			jsonMap[nonCodecKey] = sanitizeCodec(value);
		});

		return jsonMap;
	}

	if (value instanceof Compact) {
		return sanitizeCodec(value.unwrap());
	}

	// Should cover Vec, VecAny, VecFixed, Tuple
	if (value instanceof AbstractArray) {
		console.log(value);
		return value.map((element: Codec) => sanitizeCodec(element));
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

	console.log(data);
	if (Array.isArray(data)) {
		return data.map(sanitizeData);
	}

	// Pretty much everything is an object so we need to check this last
	console.log(data);
	if (isObject(data)) {
		return Object.entries(data).reduce((saniObj, [key, value]) => {
			saniObj[key] = sanitizeData(value);
			return saniObj;
		}, {} as { [prop: string]: AnyJson });
	}

	// If we have gotten to here than it is not a Codec, Array or Object
	// so likely it is string, number, boolean, null, or undefined
	// I will likely remove this check and just have in testing since it is expensive
	if (!isAnyJson(data)) {
		console.error('Sanitized data could not be forced to `AnyJson`');
		console.error(data);
		throw new InternalServerError(
			'Sanitized data could not be forced to `AnyJson`'
		);
	}
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

function isArrayAnyJson(thing: unknown): boolean {
	if (thing && Array.isArray(thing)) {
		for (const element of thing) {
			if (!isAnyJson(element)) {
				return false;
			}
		}
		return true;
	}
	return false;
}

function isObjectAnyJson(thing: unknown): boolean {
	if (thing && isObject(thing)) {
		for (const value of Object.values(thing)) {
			if (!isAnyJson(value)) {
				return false;
			}
		}

		return true;
	}

	return false;
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
