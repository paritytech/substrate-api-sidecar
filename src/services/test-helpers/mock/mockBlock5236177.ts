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

import { assetHubWestendRegistryV9435 } from '../../../test-helpers/registries';
import block5236177 from './data/block5236177.json';

/**
 * Mock for Asset Hub Westend Block #5236177.
 */
export const mockBlock5236177 = assetHubWestendRegistryV9435.createType('Block', block5236177);

/**
 * BlockHash for Asset Hub Westend Block #5236177.
 */
export const blockHash5236177 = assetHubWestendRegistryV9435.createType(
	'BlockHash',
	'0x270c4262eacfd16f05a63ef36eeabf165abbc3a4c53d0480f5460e6d5b2dc8b5',
);
