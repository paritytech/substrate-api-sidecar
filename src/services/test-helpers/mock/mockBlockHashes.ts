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

import { polkadotRegistry } from '../../../test-helpers/registries';

/**
 * BlockHash for polkadot block #20000
 */
export const blockHash20000 = polkadotRegistry.createType(
	'BlockHash',
	'0x1c309003c5737bb473fa04dc3cce638122d5ffd64497e024835bce71587c4d46',
);

/** BlockHash for polkadot block #1000000 */
export const blockHash100000 = polkadotRegistry.createType(
	'BlockHash',
	'0x490cd542b4a40ad743183c7d1088a4fe7b1edf21e50c850b86f29e389f31c5c1',
);
