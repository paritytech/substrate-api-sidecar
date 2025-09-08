// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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
 * Migration boundaries for AssetHub staking migration
 * These define when staking migrated from relay chain to AssetHub
 */
export interface IMigrationBoundaries {
	relayChainLastEra: number;
	assetHubFirstEra: number;
	assetHubMigrationStartedAt: number;
	assetHubMigrationEndedAt: number;
	relayMigrationStartedAt: number;
	relayMigrationEndedAt: number;
}

export const MIGRATION_BOUNDARIES: Record<string, IMigrationBoundaries> = {
	westmint: {
		relayChainLastEra: 9297,
		assetHubFirstEra: 9297,
		assetHubMigrationStartedAt: 11716733,
		assetHubMigrationEndedAt: 11736597,
		relayMigrationStartedAt: 26041702,
		relayMigrationEndedAt: 26071771,
	},
	'asset-hub-paseo': {
		relayChainLastEra: 2218,
		assetHubFirstEra: 2218,
		assetHubMigrationStartedAt: 2593897,
		assetHubMigrationEndedAt: 2594172,
		relayMigrationStartedAt: 7926930,
		relayMigrationEndedAt: 7927225,
	},
};

export const relayToSpecMapping = new Map([
	['polkadot', 'statemint'],
	['kusama', 'statemine'],
	['westend', 'westmint'],
	['paseo', 'asset-hub-paseo'],
]);
