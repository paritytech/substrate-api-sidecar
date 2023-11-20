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

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize';
import { polkadotRegistry } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import fetchStorageRes from '../test-helpers/responses/pallets/fetchStorage789629.json';
import fetchStorageIdsOnlyRes from '../test-helpers/responses/pallets/fetchStorageIdsOnly789629.json';
import fetchStorageItemRes from '../test-helpers/responses/pallets/fetchStorageItem789629.json';
import { PalletsStorageService } from './PalletsStorageService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistry.createType('ReferendumInfo');
	});

const mockHistoricApi = {
	registry: polkadotRegistry,
	query: {
		democracy: {
			referendumInfoOf: referendumInfoOfAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

/**
 * Mock PalletsStorageService instance.
 */
const palletsStorageService = new PalletsStorageService(mockApi);

describe('PalletStorageService', () => {
	describe('fetchStorageItem', () => {
		it('works with a query to a single key storage map', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						keys: ['0'],
						metadata: false,
					}),
				),
			).toMatchObject(fetchStorageItemRes);
		});

		it('works with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '15',
						storageItemId: 'referendumInfoOf',
						keys: ['0'],
						metadata: false,
					}),
				),
			).toMatchObject(fetchStorageItemRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						keys: ['0'],
						metadata: true,
					}),
				),
			).toMatchObject(fetchStorageItemRes);
		});
	});

	describe('fetchStorage', () => {
		it('works with no query params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchStorageRes);
		});

		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '15',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchStorageRes);
		});

		it('only list storage item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: true,
					}),
				),
			).toStrictEqual(fetchStorageIdsOnlyRes);
		});
	});
});
