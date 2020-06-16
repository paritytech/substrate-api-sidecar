/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import AbstractInt from '@polkadot/types/codec/AbstractInt';

export function parseBlockNumber(n: string): number {
	const num = Number(n);

	if (!Number.isInteger(num) || num < 0) {
		throw { error: 'Invalid block number' };
	}

	return num;
}

// A sanitizer for arbitrary data that's going to be
// stringified to JSON. We find all instances of `AbstractInt`,
// which is using bn.js as backend, and forcibly serialize it
// to a decimal string.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function sanitizeNumbers(data: any): any {
	if (typeof data === 'number' || data instanceof AbstractInt) {
		return data.toString(10);
	}

	if (data instanceof Object) {
		if (data._raw != null && data._raw instanceof AbstractInt) {
			return data._raw.toString(10);
		}

		if (data.raw != null && data.raw instanceof AbstractInt) {
			return data.raw.toString(10);
		}

		if (data.isSome === true) {
			data = data.unwrap();
		} else if (data.isNone == true) {
			return data;
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
