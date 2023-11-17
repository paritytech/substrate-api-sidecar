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
import block789629 from './data/block789629.json';
import block789629Fork from './data/blocks789629Fork.json';

/**
 * Mock for polkadot block #789629.
 */
export const mockBlock789629 = polkadotRegistry.createType('Block', block789629);

/**
 * BlockHash for polkadot block #789629.
 */
export const blockHash789629 = polkadotRegistry.createType(
	'BlockHash',
	'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
);

/**
 * Mock for polkadot forked block #789629.
 */
export const mockForkedBlock789629 = polkadotRegistry.createType('Block', block789629Fork);
