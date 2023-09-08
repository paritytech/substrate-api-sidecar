// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import type { Codec } from '@polkadot/types/types';

export type { Codec } from '@polkadot/types/types';

export function isCodec(thing: unknown): thing is Codec {
	// Null errors on .hash access so we do not check for .hash

	return (
		!!thing &&
		(thing as Codec).encodedLength !== undefined &&
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
