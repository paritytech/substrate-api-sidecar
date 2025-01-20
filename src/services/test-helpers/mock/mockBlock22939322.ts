// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { kusamaRegistryV1002000 } from '../../../test-helpers/registries';
import block22939322 from './data/block22939322.json';

/**
 * Mock for Kusama block #22939322.
 */
export const mockBlock22939322 = kusamaRegistryV1002000.createType('Block', block22939322);

/**
 * BlockHash for Kusama block #22939322.
 */
export const blockHash22939322 = kusamaRegistryV1002000.createType(
	'BlockHash',
	'0x1ef674fffb042c9016987e0e3995a36401a7e2b66e0b6c0bb111a0b049857098',
);
