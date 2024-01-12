// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { polkadotRegistryV1000001 } from '../../../test-helpers/registries';
import block18468942 from './data/block18468942.json';

/**
 * Mock for Polkadot Block #18468942.
 */
export const mockBlock18468942 = polkadotRegistryV1000001.createType('Block', block18468942);

/**
 * BlockHash for Polkadot Block #18468942.
 */
export const blockHash18468942 = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0x1ffece02b91e52c4923827843774f705911905c0a66980f7037bed643b746d1d',
);
