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

import { expandMetadata } from '@polkadot/types/metadata/decorate';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import { polkadotRegistry } from '../registries/polkadotRegistry';
import { kusamaMetadata, polkadotMetadata } from './metadata';

/**
 * Decorated metadata of the kusamaRegistry (v2008).
 */
export const decoratedKusamaMetadata = expandMetadata(kusamaRegistry, kusamaMetadata);

/**
 * Decorated metadata of the polkadotRegistry (v16).
 */
export const decoratedPolkadotMetadata = expandMetadata(polkadotRegistry, polkadotMetadata);
