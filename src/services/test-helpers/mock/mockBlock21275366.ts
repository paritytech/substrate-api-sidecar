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
import block21275366 from './data/block21275366.json';

/**
 * Mock for Polkadot Block #21275366.
 */
export const mockBlock21275366 = polkadotRegistryV1000001.createType('Block', block21275366);

/**
 * BlockHash for Polkadot Block #21275366.
 */
export const blockHash21275366 = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0x109d98b52cd3c76801e6881ec5c746eac9a3d5e6017b0b2883a85d6b2907f5dc',
);
