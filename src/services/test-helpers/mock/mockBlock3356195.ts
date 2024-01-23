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

import { assetHubKusamaRegistryV1000000 } from '../../../test-helpers/registries';
import block3356195 from './data/block3356195.json';

/**
 * Mock for Asset Hub Kusama Block #3356195.
 */
export const mockBlock3356195 = assetHubKusamaRegistryV1000000.createType('Block', block3356195);

/**
 * BlockHash for Asset Hub Kusama Block #3356195.
 */
export const blockHash3356195 = assetHubKusamaRegistryV1000000.createType(
	'BlockHash',
	'0x5f752962918b7fb98e36d7e9656ddd0f431c4103b370c738bbb8fccf7f4a0578',
);
