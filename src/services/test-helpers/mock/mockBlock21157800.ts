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

import { polkadotRegistryV1002000 } from '../../../test-helpers/registries';
import block21157800 from './data/block21157800.json';

/**
 * Mock for Polkadot block #21157800.
 */
export const mockBlock21157800 = polkadotRegistryV1002000.createType('Block', block21157800);

/**
 * BlockHash for Polkadot block #21157800.
 */
export const blockHash21157800 = polkadotRegistryV1002000.createType(
	'BlockHash',
	'0x59de258cf9999635c866df7bc5f397d152892827f887d3629344cb3cebba134f',
);
