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
import { InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize';
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { getPalletEvents } from '../test-helpers/mock/data/mockPalletEventsData';
import fetchEventsOnlyIdsRes from '../test-helpers/responses/pallets/fetchEventsOnlyIdsRes.json';
import fetchEventsRes from '../test-helpers/responses/pallets/fetchEventsRes.json';
import fetchExternalTabled from '../test-helpers/responses/pallets/fetchExternalTabledEventItem789629.json';
import fetchProposedRes from '../test-helpers/responses/pallets/fetchProposedEventItem789629.json';
import fetchTabledRes from '../test-helpers/responses/pallets/fetchTabledEventItem789629.json';
import { PalletsEventsService } from './PalletsEventsService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistryV9300.createType('ReferendumInfo');
	});

const mockHistoricApi = {
	registry: polkadotRegistryV9300,
	events: getPalletEvents,
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
 * Mock PalletsEventsService instance.
 */
const palletsEventsService = new PalletsEventsService(mockApi);

describe('PalletEventsService', () => {
	describe('fetchEventItem', () => {
		it('works with a query to a single error item id', async () => {
			expect(
				sanitizeNumbers(
					await palletsEventsService.fetchEventItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						eventItemId: 'Proposed',
						metadata: true,
					}),
				),
			).toMatchObject(fetchProposedRes);
		});

		it('works with an index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsEventsService.fetchEventItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '14',
						eventItemId: 'Tabled',
						metadata: false,
					}),
				),
			).toMatchObject(fetchTabledRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsEventsService.fetchEventItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						eventItemId: 'ExternalTabled',
						metadata: true,
					}),
				),
			).toMatchObject(fetchExternalTabled);
		});

		it('throws an error when an event id isnt found', async () => {
			expect.assertions(2);
			try {
				sanitizeNumbers(
					await palletsEventsService.fetchEventItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						eventItemId: 'IncorrectEventId',
						metadata: true,
					}),
				);
			} catch (error) {
				expect(error).toBeInstanceOf(InternalServerError);
				expect(error).toEqual(
					new InternalServerError(
						`Could not find events item ("IncorrectEventId") in metadata. events item names are expected to be in camel case, e.g. 'storageItemId'`,
					),
				);
			}
		});
	});

	describe('fetchEvents', () => {
		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsEventsService.fetchEvents(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '14',
						onlyIds: false,
					}),
				),
			).toStrictEqual(fetchEventsRes);
		});

		it('only list error item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsEventsService.fetchEvents(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: true,
					}),
				),
			).toStrictEqual(fetchEventsOnlyIdsRes);
		});
	});
});
