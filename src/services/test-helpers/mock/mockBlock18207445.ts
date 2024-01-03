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
import block18207445 from './data/block18207445.json';

/**
 * Mock for Polkadot Block #18207445.
 */
export const mockBlock18207445 = polkadotRegistryV1000001.createType('Block', block18207445);

/**
 * BlockHash for Polkadot Block #18207445.
 */
export const blockHash18207445 = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0xc759aa0846fb1d608f8ac36d7f66b202dbe1424bd6b36ff7b0d2bb7b79cce055',
);
