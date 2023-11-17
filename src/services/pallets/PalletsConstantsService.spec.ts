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
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { blockHash13641102, defaultMockApi } from '../test-helpers/mock';
import fetchConstantOnlyIdsRes from '../test-helpers/responses/pallets/fetchConstantsOnlyIdsRes.json';
import fetchConstantRes from '../test-helpers/responses/pallets/fetchConstantsRes.json';
import fetchEnactmentPeriodRes from '../test-helpers/responses/pallets/fetchEnactmentPeriodConstsItem789629.json';
import fetchLaunchPeriodRes from '../test-helpers/responses/pallets/fetchLaunchPeriodConstsItem789629.json';
import fetchVotingPeriodRes from '../test-helpers/responses/pallets/fetchVotingPeriodConstsItem789629.json';
import { PalletsConstantsService } from './PalletsConstantsService';

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
 * Mock PalletsConstantsService instance.
 */
const palletsConstantsService = new PalletsConstantsService(mockApi);

describe('PalletConstantsService', () => {
	describe('fetchConstantItem', () => {
		it('works with a query to a single constant item id', async () => {
			expect(
				sanitizeNumbers(
					await palletsConstantsService.fetchConstantItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						constantItemId: 'EnactmentPeriod',
						metadata: false,
					}),
				),
			).toMatchObject(fetchEnactmentPeriodRes);
		});

		it('works with an index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsConstantsService.fetchConstantItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						constantItemId: 'LaunchPeriod',
						metadata: false,
					}),
				),
			).toMatchObject(fetchLaunchPeriodRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsConstantsService.fetchConstantItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						constantItemId: 'VotingPeriod',
						metadata: true,
					}),
				),
			).toMatchObject(fetchVotingPeriodRes);
		});
	});

	describe('fetchConstants', () => {
		it('works with an index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsConstantsService.fetchConstants(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchConstantRes);
		});

		it('only lists constant item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsConstantsService.fetchConstants(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						onlyIds: true,
					}),
				),
			).toStrictEqual(fetchConstantOnlyIdsRes);
		});
	});
});
