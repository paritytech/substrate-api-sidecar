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
import { getPalletErrors } from '../test-helpers/mock/data/mockPalletErrorsData';
import fetchErrorOnlyIdsRes from '../test-helpers/responses/pallets/fetchErrorsOnlyIdsRes.json';
import fetchErrorRes from '../test-helpers/responses/pallets/fetchErrorsRes.json';
import fetchInsufficientFundsRes from '../test-helpers/responses/pallets/fetchInsufficientFundsErrorItem13641102.json';
import fetchProposalMissingRes from '../test-helpers/responses/pallets/fetchProposalMissingErrorItem13641102.json';
import fetchValueLowRes from '../test-helpers/responses/pallets/fetchValueLowErrorItem13641102.json';
import { PalletsErrorsService } from './PalletsErrorsService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistryV9300.createType('ReferendumInfo');
	});

const mockHistoricApi = {
	registry: polkadotRegistryV9300,
	errors: getPalletErrors,
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
 * Mock PalletsErrorsService instance.
 */
const palletsErrorsService = new PalletsErrorsService(mockApi);

describe('PalletErrorService', () => {
	describe('fetchErrorItem', () => {
		it('works with a query to a single error item id', async () => {
			expect(
				sanitizeNumbers(
					await palletsErrorsService.fetchErrorItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						errorItemId: 'ValueLow',
						metadata: false,
					}),
				),
			).toMatchObject(fetchValueLowRes);
		});

		it('works with an index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsErrorsService.fetchErrorItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						errorItemId: 'InsufficientFunds',
						metadata: false,
					}),
				),
			).toMatchObject(fetchInsufficientFundsRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsErrorsService.fetchErrorItem(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						errorItemId: 'ProposalMissing',
						metadata: true,
					}),
				),
			).toMatchObject(fetchProposalMissingRes);
		});
	});

	describe('fetchErrors', () => {
		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsErrorsService.fetchErrors(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: '14',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchErrorRes);
		});

		it('only list error item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsErrorsService.fetchErrors(mockHistoricApi, {
						hash: blockHash13641102,
						palletId: 'democracy',
						onlyIds: true,
					}),
				),
			).toStrictEqual(fetchErrorOnlyIdsRes);
		});
	});
});
