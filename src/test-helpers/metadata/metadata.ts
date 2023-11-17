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

import { Metadata } from '@polkadot/types/metadata';

import { assetHubWestendRegistryV9435 } from '../registries/assetHubWestendRegistry';
import { kusamaRegistry } from '../registries/kusamaRegistry';
import { polkadotRegistry, polkadotRegistryV29, polkadotRegistryV9300 } from '../registries/polkadotRegistry';
import { assetHubWestendMetadataRpcV9435 } from './assetHubWestendMetadata';
import { kusamaMetadataV2008 } from './kusamaV2008Metadata';
import { polkadotMetadataRpcV16 } from './polkadotV16Metadata';
import { polkadotMetadataRpcV29 } from './polkadotV29Metadata';
import { polkadotMetadataRpcV9300 } from './polkadotV9300Metadata';
/**
 * Metadata of the polkadotRegistry (v16).
 */
export const polkadotMetadata = new Metadata(polkadotRegistry, polkadotMetadataRpcV16);

/**
 * Metadata of the kusamaRegistry (v2008).
 */
export const kusamaMetadata = new Metadata(kusamaRegistry, kusamaMetadataV2008);

/**
 * Metadata of polkadotRegistry (v29)
 */
export const polkadotMetadataV29 = new Metadata(polkadotRegistryV29, polkadotMetadataRpcV29);

/**
 * Metadata of polkadotRegistry (v9300)
 */
export const polkadotMetadataV9300 = new Metadata(polkadotRegistryV9300, polkadotMetadataRpcV9300);

/**
 * Metadata of assetHubWestendRegistry (v9435)
 */
export const assetHubWestendMetadata = new Metadata(assetHubWestendRegistryV9435, assetHubWestendMetadataRpcV9435);
