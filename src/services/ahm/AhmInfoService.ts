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

import { Option, u32 } from '@polkadot/types-codec';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { AbstractService } from '../AbstractService';
import { MIGRATION_BOUNDARIES, relayToSpecMapping } from '../consts';

interface IAhmStartEndBlocks {
	startBlock: number | null;
	endBlock: number | null;
}

export interface IAhmInfo {
	relay: IAhmStartEndBlocks;
	assetHub: IAhmStartEndBlocks;
}

export class AhmInfoService extends AbstractService {
	/**
	 * Fetch Asset Hub Migration information at a given block.
	 *
	 * @param hash `BlockHash` to make call at.
	 */
	async fetchAhmInfo(): Promise<IAhmInfo> {
		if (ApiPromiseRegistry.assetHubInfo.isAssetHub) {
			return this.handleFromAh();
		} else {
			return this.handleFromRelay();
		}
	}

	// Handle the AHM info When the main connection is asset hub
	async handleFromAh(): Promise<IAhmInfo> {
		const { specName } = this;
		const migrationBoundaries = MIGRATION_BOUNDARIES[specName];

		if (migrationBoundaries) {
			return {
				relay: {
					startBlock: migrationBoundaries.relayMigrationStartedAt,
					endBlock: migrationBoundaries.relayMigrationEndedAt,
				},
				assetHub: {
					startBlock: migrationBoundaries.assetHubMigrationStartedAt,
					endBlock: migrationBoundaries.assetHubMigrationEndedAt,
				},
			};
		} else {
			// Sanity check to ensure the proper pallet exists
			if (!this.api.query.ahMigrator) {
				return {
					relay: {
						startBlock: null,
						endBlock: null,
					},
					assetHub: {
						startBlock: null,
						endBlock: null,
					},
				};
			}

			const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

			// We have a multi-chain connection so we can get all values from the relay and asset hub
			if (rcApi) {
				const [ahStart, ahEnd, rcStart, rcEnd] = await Promise.all([
					this.api.query.ahMigrator?.migrationStartBlock<Option<u32>>(),
					this.api.query.ahMigrator?.migrationEndBlock<Option<u32>>(),
					rcApi.query.rcMigrator?.migrationStartBlock<Option<u32>>(),
					rcApi.query.rcMigrator?.migrationEndBlock<Option<u32>>(),
				]);

				return {
					relay: {
						startBlock: rcStart.isSome ? rcStart.unwrap().toNumber() : null,
						endBlock: rcEnd.isSome ? rcEnd.unwrap().toNumber() : null,
					},
					assetHub: {
						startBlock: ahStart.isSome ? ahStart.unwrap().toNumber() : null,
						endBlock: ahEnd.isSome ? ahEnd.unwrap().toNumber() : null,
					},
				};
			} else {
				const [ahStart, ahEnd] = await Promise.all([
					this.api.query.ahMigrator?.migrationStartBlock<Option<u32>>(),
					this.api.query.ahMigrator?.migrationEndBlock<Option<u32>>(),
				]);

				return {
					relay: {
						startBlock: null,
						endBlock: null,
					},
					assetHub: {
						startBlock: ahStart.isSome ? ahStart.unwrap().toNumber() : null,
						endBlock: ahEnd.isSome ? ahEnd.unwrap().toNumber() : null,
					},
				};
			}
		}
	}

	async handleFromRelay(): Promise<IAhmInfo> {
		const { specName } = this;
		const hasRelaySpec = relayToSpecMapping.has(specName);

		if (!hasRelaySpec) {
			throw new Error("Invalid chain specName. Can't map specName to asset hub spec");
		}

		const assetHubSpecName = relayToSpecMapping.get(specName)!;
		const migrationBoundaries = MIGRATION_BOUNDARIES[assetHubSpecName];

		if (migrationBoundaries) {
			return {
				relay: {
					startBlock: migrationBoundaries.relayMigrationStartedAt,
					endBlock: migrationBoundaries.relayMigrationEndedAt,
				},
				assetHub: {
					startBlock: migrationBoundaries.assetHubMigrationStartedAt,
					endBlock: migrationBoundaries.assetHubMigrationEndedAt,
				},
			};
		} else {
			// Sanity check to ensure the proper pallet exists
			if (!this.api.query.rcMigrator) {
				return {
					relay: {
						startBlock: null,
						endBlock: null,
					},
					assetHub: {
						startBlock: null,
						endBlock: null,
					},
				};
			}

			const ahApi = ApiPromiseRegistry.getApiByType('assetHub')[0]?.api;

			// We have a multi-chain connection so we can get all values from the relay and asset hub
			if (ahApi) {
				const [rcStart, rcEnd, ahStart, ahEnd] = await Promise.all([
					this.api.query.rcMigrator?.migrationStartBlock<Option<u32>>(),
					this.api.query.rcMigrator?.migrationEndBlock<Option<u32>>(),
					ahApi.query.ahMigrator?.migrationStartBlock<Option<u32>>(),
					ahApi.query.ahMigrator?.migrationEndBlock<Option<u32>>(),
				]);

				return {
					relay: {
						startBlock: rcStart.isSome ? rcStart.unwrap().toNumber() : null,
						endBlock: rcEnd.isSome ? rcEnd.unwrap().toNumber() : null,
					},
					assetHub: {
						startBlock: ahStart.isSome ? ahStart.unwrap().toNumber() : null,
						endBlock: ahEnd.isSome ? ahEnd.unwrap().toNumber() : null,
					},
				};
			} else {
				const [rcStart, rcEnd] = await Promise.all([
					this.api.query.rcMigrator?.migrationStartBlock<Option<u32>>(),
					this.api.query.rcMigrator?.migrationEndBlock<Option<u32>>(),
				]);

				return {
					relay: {
						startBlock: rcStart.isSome ? rcStart.unwrap().toNumber() : null,
						endBlock: rcEnd.isSome ? rcEnd.unwrap().toNumber() : null,
					},
					assetHub: {
						startBlock: null,
						endBlock: null,
					},
				};
			}
		}
	}
}
