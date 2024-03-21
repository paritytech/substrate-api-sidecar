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
import block19772575 from './data/block19772575.json';

/**
 * Mock for Polkadot Block #19772575.
 */
export const mockBlock19772575 = polkadotRegistryV1000001.createType('Block', block19772575);

/**
 * BlockHash for Polkadot Block #19772575.
 */
export const blockHash19772575 = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0xbbb99b1d43d6c1885e09806e4d8fd3beaa30a87046397e8dfc44ced45ed735a9',
);
