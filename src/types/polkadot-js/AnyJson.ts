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
