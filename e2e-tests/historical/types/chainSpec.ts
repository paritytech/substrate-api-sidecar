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

/**
 * String literal for specific chains that are being tested for
 */
export type ChainSpec = 'polkadot' | 'kusama' | 'westend' | 'asset-hub-kusama' | 'asset-hub-westend' | 'westmint';

/**
 * Sidecar endpoints that are supported
 */
export type EndpointSpec = 'blocks' | 'accounts' | 'runtime' | 'paras';

/**
 * Chain object and the associated endpoints
 */
export type ChainEndpoints = Record<EndpointSpec, string[][]>;

/**
 * Chain Config that is passed into the env
 */
export interface IEnvChainConfig {
	chain: string;
}

/**
 * All chains that are supported to test against
 */
export interface IChains {
	kusama: ChainEndpoints;
	polkadot: ChainEndpoints;
	westend: ChainEndpoints;
	'asset-hub-kusama': ChainEndpoints;
	'asset-hub-polkadot': ChainEndpoints;
	'asset-hub-westend': ChainEndpoints;
	westmint: ChainEndpoints;
}
