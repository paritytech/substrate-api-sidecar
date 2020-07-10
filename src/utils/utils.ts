/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	BTreeSet,
	Compact,
	Enum,
	HashMap,
	Set as CodecSet,
	Struct,
} from '@polkadot/types';
import AbstractInt from '@polkadot/types/codec/AbstractInt';
import Option from '@polkadot/types/codec/Option';
import { AnyJson, Codec } from '@polkadot/types/types';
import * as BN from 'bn.js';

/**
 * A sanitizer for arbitrary data that's going to be
 * stringified to JSON. We find all instances of `AbstractInt`,
 * which is using bn.js as backend, and forcibly serialize it
 * to a decimal string.
 *
 * @param data
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function sanitizeNumbers(data: any): any {
	if (data instanceof Option) {
		return data.isSome ? sanitizeNumbers(data.unwrap()) : null;
	}

	if (data instanceof Compact) {
		return sanitizeNumbers(data.unwrap());
	}

	if (data instanceof Enum) {
		if (data.isBasic) {
			return data.toJSON();
		}

		return { [data.type]: sanitizeNumbers(data.value) };
	}

	if (data instanceof BTreeSet) {
		const jsonSet: unknown[] = [];

		data.forEach((element: Codec) => {
			jsonSet.push(sanitizeNumbers(element));
		});

		return jsonSet;
	}

	if (data instanceof Struct) {
		return data.defKeys.reduce((jsonStruct, key) => {
			const property = data.get(key);
			if (!property) {
				return jsonStruct;
			}

			jsonStruct[key] = sanitizeNumbers(property);
			return jsonStruct;
		}, {} as Record<string, AnyJson>);
	}

	if (data instanceof HashMap || data instanceof Map) {
		const jsonMap: AnyJson = {};

		data.forEach((value: unknown, key: unknown) => {
			const nonCodecKey = sanitizeNumbers(key);
			if (
				!(typeof nonCodecKey === 'string' || typeof nonCodecKey === 'number')
			) {
				console.error(
					'Unexpected non-string and non-number key while sanitizing a Map-like type'
				);
			}

			jsonMap[nonCodecKey] = sanitizeNumbers(value);
		});

		return jsonMap;
	}

	if (data instanceof CodecSet) {
		// CodecSet is essentially just a JS Set<string>
		return data.strings;
	}
	if (data instanceof Set) {
		const jsonSet = [];

		for (const element of data) {
			jsonSet.push(sanitizeNumbers(element));
		}

		return jsonSet;
	}

	if (
		typeof data === 'number' ||
		data instanceof AbstractInt ||
		data instanceof BN
	) {
		return data.toString(10);
	}

	if (data instanceof Object) {
		if (data._raw != null && data._raw instanceof AbstractInt) {
			return data._raw.toString(10);
		}

		if (data.raw != null && data.raw instanceof AbstractInt) {
			return data.raw.toString(10);
		}

		if (typeof data.toJSON === 'function') {
			const json = data.toJSON();

			if (Array.isArray(json)) {
				return data.map(sanitizeNumbers);
			}

			if (json instanceof Object) {
				const obj = {};

				for (const key of Object.keys(json)) {
					if (key in data) {
						// Prefer un-JSON-ified fields
						obj[key] = sanitizeNumbers(data[key]);
					} else {
						obj[key] = sanitizeNumbers(json[key]);
					}
				}

				return obj;
			}

			return json;
		}

		if (Array.isArray(data)) {
			return data.map(sanitizeNumbers);
		}

		const obj = {};
		for (const key of Object.keys(data)) {
			obj[key] = sanitizeNumbers(data[key]);
		}
		return obj;
	}

	return data;
}
