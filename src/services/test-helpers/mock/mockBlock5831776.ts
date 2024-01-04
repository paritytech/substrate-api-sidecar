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
import block5831776 from './data/block5831776.json';

/**
 * Mock for Asset Hub Kusama Block #5831776.
 */
export const mockBlock5831776 = assetHubKusamaRegistryV1000000.createType('Block', block5831776);

/**
 * BlockHash for Asset Hub Kusama Block #5831776.
 */
export const blockHash5831776 = assetHubKusamaRegistryV1000000.createType(
	'BlockHash',
	'0x39b583d2f9e6dcfb0f09ae0ebb67269ccf6c42d2d6f995da725db362b937d5bd',
);
