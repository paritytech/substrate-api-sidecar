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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */

import { ApiPromise } from '@polkadot/api';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { polkadotRegistry } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import { AhmInfoService } from './AhmInfoService';

// Mock data for Westend Asset Hub migration boundaries
const westendMigrationBoundaries = {
	relay: {
		startBlock: 26041702,
		endBlock: 26071771,
	},
	assetHub: {
		startBlock: 11716733,
		endBlock: 11736597,
	},
};

// Mock on-chain pallet responses
const mockMigrationStartBlock = (blockNumber: number | null) =>
	Promise.resolve().then(() => {
		if (blockNumber === null) {
			return polkadotRegistry.createType('Option<u32>', null);
		}
		return polkadotRegistry.createType('Option<u32>', blockNumber);
	});

const mockMigrationEndBlock = (blockNumber: number | null) =>
	Promise.resolve().then(() => {
		if (blockNumber === null) {
			return polkadotRegistry.createType('Option<u32>', null);
		}
		return polkadotRegistry.createType('Option<u32>', blockNumber);
	});

// Mock API for Westend Asset Hub
const mockAssetHubApi = {
	...defaultMockApi,
	query: {
		ahMigrator: {
			migrationStartBlock: () => mockMigrationStartBlock(11716733),
			migrationEndBlock: () => mockMigrationEndBlock(11736597),
		},
	},
} as unknown as ApiPromise;

// Mock API for Westend Relay Chain
const mockRelayChainApi = {
	...defaultMockApi,
	query: {
		rcMigrator: {
			migrationStartBlock: () => mockMigrationStartBlock(26041702),
			migrationEndBlock: () => mockMigrationEndBlock(26071771),
		},
	},
} as unknown as ApiPromise;

describe('AhmInfoService', () => {
	let ahmInfoService: AhmInfoService;

	beforeEach(() => {
		ahmInfoService = new AhmInfoService('westmint');
		jest.clearAllMocks();
	});

	describe('fetchAhmInfo', () => {
		describe('when connected to Asset Hub (static boundaries)', () => {
			beforeEach(() => {
				// Mock Asset Hub connection
				ApiPromiseRegistry.assetHubInfo = {
					isAssetHub: true,
					isAssetHubMigrated: true,
				};
			});

			it('should return static migration boundaries for westmint', async () => {
				const result = await ahmInfoService.fetchAhmInfo();

				expect(result).toEqual(westendMigrationBoundaries);
			});
		});

		describe('when connected to Asset Hub (on-chain pallets)', () => {
			beforeEach(() => {
				// Mock Asset Hub connection with unknown spec
				ahmInfoService = new AhmInfoService('unknown-spec');

				ApiPromiseRegistry.assetHubInfo = {
					isAssetHub: true,
					isAssetHubMigrated: true,
				};

				jest.spyOn(ApiPromiseRegistry, 'getApi').mockReturnValue(mockAssetHubApi);
			});

			it('should query on-chain ahMigrator pallet when no static boundaries exist', async () => {
				// Mock single-chain setup (no relay chain connection)
				jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockReturnValue([]);

				const result = await ahmInfoService.fetchAhmInfo();

				expect(result).toEqual({
					relay: {
						startBlock: null,
						endBlock: null,
					},
					assetHub: {
						startBlock: 11716733,
						endBlock: 11736597,
					},
				});
			});

			it('should query both chains when multi-chain setup is available', async () => {
				// Mock multi-chain setup
				jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockReturnValue([{ api: mockRelayChainApi, specName: '' }]);

				const result = await ahmInfoService.fetchAhmInfo();

				expect(result).toEqual(westendMigrationBoundaries);
			});
		});

		describe('when connected to Relay Chain (static boundaries)', () => {
			beforeEach(() => {
				// Mock Relay Chain connection
				ahmInfoService = new AhmInfoService('westend');

				ApiPromiseRegistry.assetHubInfo = {
					isAssetHub: false,
					isAssetHubMigrated: false,
				};
			});

			it('should return static migration boundaries for westend relay chain', async () => {
				const result = await ahmInfoService.fetchAhmInfo();

				expect(result).toEqual(westendMigrationBoundaries);
			});
		});

		describe('error scenarios', () => {
			beforeEach(() => {
				ApiPromiseRegistry.assetHubInfo = {
					isAssetHub: false,
					isAssetHubMigrated: false,
				};
			});

			it('should throw error for invalid relay chain spec', async () => {
				ahmInfoService = new AhmInfoService('invalid-spec');

				await expect(ahmInfoService.fetchAhmInfo()).rejects.toThrow(
					"Invalid chain specName. Can't map specName to asset hub spec",
				);
			});
		});
	});
});
