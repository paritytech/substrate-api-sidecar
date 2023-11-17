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

import { polkadotRegistryV9300 } from '../../../test-helpers/registries';
import block13641102 from './data/blocks13641102.json';

/**
 * Mock for polkadot block #13641102.
 */
export const mockBlock13641102 = polkadotRegistryV9300.createType('Block', block13641102);

/**
 * BlockHash for polkadot block #13641102.
 */
export const blockHash13641102 = polkadotRegistryV9300.createType(
	'BlockHash',
	'0x18707858d4a24cf7235d4e1b45ab1665e61050d01a8a01397f3423ffd6937655',
);
