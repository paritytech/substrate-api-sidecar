// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { blockHash13641102, defaultMockApi } from '../test-helpers/mock';
import fetchDispatchablesOnlyIdsRes from '../test-helpers/responses/pallets/fetchDispatchablesOnlyIdsRes.json';
import fetchDispatchableRes from '../test-helpers/responses/pallets/fetchDispatchablesRes.json';
import fetchProposeRes from '../test-helpers/responses/pallets/fetchProposeDispatchableItem789629.json';
import fetchSecondRes from '../test-helpers/responses/pallets/fetchSecondDispatchableItem789629.json';
import fetchVoteRes from '../test-helpers/responses/pallets/fetchVoteDispatchableItem789629.json';
import { PalletsDispatchablesService } from './PalletsDispatchablesService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistryV9300.createType('ReferendumInfo');
	});

const mockHistoricApi = {
	registry: polkadotRegistryV9300,
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
 * Mock PalletsDispatchablesService instance.
 */
const palletsDispatchablesService = new PalletsDispatchablesService(mockApi);

describe('PalletDispatchablesService', () => {
	describe('fetchDispatchableItem', () => {
		it('works with a query to a single dispatchable item id', async () => {
			expect(
				sanitizeNumbers(
					await palletsDispatchablesService.fetchDispatchableItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						dispatchableItemId: 'propose',
						metadata: false,
					}),
				),
			).toMatchObject(fetchProposeRes);
		});

		it('works with an index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsDispatchablesService.fetchDispatchableItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						dispatchableItemId: 'second',
						metadata: false,
					}),
				),
			).toMatchObject(fetchSecondRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsDispatchablesService.fetchDispatchableItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						dispatchableItemId: 'vote',
						metadata: true,
					}),
				),
			).toMatchObject(fetchVoteRes);
		});
	});

	describe('fetchDispatchables', () => {
		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsDispatchablesService.fetchDispatchables(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchDispatchableRes);
		});

		it('only list dispatchable item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsDispatchablesService.fetchDispatchables(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						onlyIds: true,
					}),
				),
			).toStrictEqual(fetchDispatchablesOnlyIdsRes);
		});
	});
});
