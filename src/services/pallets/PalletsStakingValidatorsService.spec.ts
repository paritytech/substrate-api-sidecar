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

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import type { Hash } from '@polkadot/types/interfaces';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { assetHubKusamaRegistryV9430, polkadotRegistryV9370 } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { activeEraMock } from '../test-helpers/mock/data/activeEraMock';
import { erasStakersOverview } from '../test-helpers/mock/data/erasStakersOverviewKeys';
import { validatorsEntries } from '../test-helpers/mock/data/validator14815152Entries';
import { validators14815152Hex } from '../test-helpers/mock/data/validators14815152Hex';
import fetchValidators14815152 from '../test-helpers/responses/pallets/fetchValidators14815152.json';
import { PalletsStakingValidatorsService } from './PalletsStakingValidatorsService';

const validatorsAt = () =>
	Promise.resolve().then(() => polkadotRegistryV9370.createType('Vec<AccountId32>', validators14815152Hex));

const validatorsEntriesAt = () => Promise.resolve().then(() => validatorsEntries());

const erasStakersOverviewKeys = () => Promise.resolve().then(() => erasStakersOverview());

const activeEra = () => Promise.resolve().then(() => activeEraMock());

const mockHistoricApi = {
	...defaultMockApi,
	query: {
		session: {
			validators: validatorsAt,
		},
		staking: {
			validators: {
				entries: validatorsEntriesAt,
			},
		},
	},
} as unknown as ApiDecoration<'promise'>;

// const mockApiNoStaking = {
// 	...defaultMockApi,
// 	at: (_hash: Hash) => defaultMockApi,
// } as unknown as ApiPromise;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const mockHistoricAHNextApi = {
	...defaultMockApi,
	rpc: {
		...defaultMockApi.rpc,
		state: {
			...defaultMockApi.rpc.state,
			getRuntimeVersion: () =>
				Promise.resolve().then(() => {
					return {
						specName: assetHubKusamaRegistryV9430.createType('Text', 'statemine'),
						specVersion: assetHubKusamaRegistryV9430.createType('u32', 16),
						transactionVersion: assetHubKusamaRegistryV9430.createType('u32', 2),
						implVersion: assetHubKusamaRegistryV9430.createType('u32', 0),
						implName: assetHubKusamaRegistryV9430.createType('Text', 'parity-kusama'),
						authoringVersion: assetHubKusamaRegistryV9430.createType('u32', 0),
					};
				}),
		},
	},
	query: {
		staking: {
			validators: {
				entries: validatorsEntriesAt,
			},
			activeEra,
			erasStakersOverview: {
				keys: erasStakersOverviewKeys,
			},
		},
	},
} as unknown as ApiPromise;

const mockAHNextApi = {
	...mockHistoricAHNextApi,
	at: (_hash: Hash) => mockHistoricAHNextApi,
} as unknown as ApiPromise;

const mockRCNextApi = {
	...defaultMockApi,
	query: {
		session: {
			validators: validatorsAt,
		},
		staking: null,
	},
	at: (_hash: Hash) => ({
		...defaultMockApi,
		query: {
			session: {
				validators: validatorsAt,
			},
			staking: null,
		},
	}),
} as unknown as ApiPromise;

/**
 * Mock PalletStakingProgressService instance.
 */

describe('PalletsStakingValidatorsService', () => {
	describe('derivePalletStakingValidators before AHM', () => {
		it('Works for block 14815152', async () => {
			const palletsStakingValidatorsService = new PalletsStakingValidatorsService('mock');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
			expect(
				sanitizeNumbers(
					// The inputted blockHash does not change the tests since the mocked data is all based
					// on block 14815152
					await palletsStakingValidatorsService.derivePalletStakingValidators(blockHash789629),
				),
			).toStrictEqual(fetchValidators14815152);
		});
	});

	describe('derivePalletStakingValidators after AHM', () => {
		it('it throws if historicApi does not have staking', async () => {
			ApiPromiseRegistry.assetHubInfo = {
				isAssetHub: false,
				isAssetHubMigrated: true,
			};
			const palletsStakingValidatorsService = new PalletsStakingValidatorsService('mock');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockRCNextApi);

			await expect(palletsStakingValidatorsService.derivePalletStakingValidators(blockHash789629)).rejects.toThrow(
				'Staking pallet not found for queried runtime',
			);
		});

		it('it correctly computes the response when connected to AH post AHM', async () => {
			ApiPromiseRegistry.assetHubInfo = {
				isAssetHub: false,
				isAssetHubMigrated: false,
			};
			const palletsStakingValidatorsServicePreAHM = new PalletsStakingValidatorsService('mock');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
			const preAHMResponse = await palletsStakingValidatorsServicePreAHM.derivePalletStakingValidators(blockHash789629);
			ApiPromiseRegistry.assetHubInfo = {
				isAssetHub: true,
				isAssetHubMigrated: true,
			};
			const palletsStakingValidatorsService = new PalletsStakingValidatorsService('statemine');
			const postAHMResponse = await palletsStakingValidatorsService.derivePalletStakingValidators(blockHash789629);
			for (const [index, validator] of postAHMResponse.validators.entries()) {
				expect(validator).toEqual(preAHMResponse.validators[index]);
			}

			expect(postAHMResponse.at).toEqual(preAHMResponse.at);
			expect(postAHMResponse.validatorsToBeChilled).toEqual(preAHMResponse.validatorsToBeChilled);
		});
	});
});
