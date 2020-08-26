import type { AnyJson } from '@polkadot/types/types';
import { isObject } from '@polkadot/util';

export type { AnyJson } from '@polkadot/types/types';

export function isAnyJson(thing: unknown): thing is AnyJson {
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

	return Object.values(thing).every((value) => isAnyJson(value));
}
