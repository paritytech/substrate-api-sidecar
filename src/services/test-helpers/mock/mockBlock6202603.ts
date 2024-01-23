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

import { assetHubKusamaRegistryV1000000b } from '../../../test-helpers/registries';
import block6202603 from './data/block6202603.json';

/**
 * Mock for Asset Hub Kusama Block #6202603.
 */
export const mockBlock6202603 = assetHubKusamaRegistryV1000000b.createType('Block', block6202603);

/**
 * BlockHash for Asset Hub Kusama Block #6202603.
 */
export const blockHash6202603 = assetHubKusamaRegistryV1000000b.createType(
	'BlockHash',
	'0xc94967e879d161868328c382911620b6ee6ae8687d907012f2d1ef4c18371c62',
);
