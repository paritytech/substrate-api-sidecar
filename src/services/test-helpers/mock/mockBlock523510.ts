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

import { assetHubKusamaRegistryV9430 } from '../../../test-helpers/registries';
import block523510 from './data/block523510.json';

/**
 * Mock for Asset Hub Kusama Block #523510.
 */
export const mockBlock523510 = assetHubKusamaRegistryV9430.createType('Block', block523510);

/**
 * BlockHash for Asset Hub Kusama Block #523510.
 */
export const blockHash523510 = assetHubKusamaRegistryV9430.createType(
	'BlockHash',
	'0x814bb69eba28cf13066aa025d39526b503fc563162f1301c627548b9ccec54c8',
);
