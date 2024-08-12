// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { polkadotRegistryV1000001 } from '../../test-helpers/registries';
import { blockHash13641102, blockHash21275366, defaultMockApi, mockBlock21275366 } from '../test-helpers/mock';
import { referendaEntries } from '../test-helpers/mock/data/referendaEntries';
import fetchOnGoingReferenda21275366Response from '../test-helpers/responses/pallets/fetchOnGoingReferenda21275366.json';
import { PalletsOnGoingReferendaService } from './PalletsOnGoingReferendaService';

const mockHistoricApi = {
	query: {},
	registry: polkadotRegistryV9300,
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;
/**
 * Mock PalletsOnGoingReferendaService instance.
 */
const palletsOnGoingReferendaService13641102 = new PalletsOnGoingReferendaService(mockApi);

const referendaEntriesAt = () => Promise.resolve().then(() => referendaEntries());

const mockHistoricApi21275366 = {
	registry: polkadotRegistryV1000001,
	query: {
		referenda: {
			referendumInfoFor: {
				entries: referendaEntriesAt,
			},
		},
	},
} as unknown as ApiDecoration<'promise'>;

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock21275366.header);

const mockApi21275366 = {
	rpc: {
		chain: {
			getHeader,
		},
	},
	at: (_hash: Hash) => mockHistoricApi21275366,
} as unknown as ApiPromise;

const palletsOnGoingReferendaService21275366 = new PalletsOnGoingReferendaService(mockApi21275366);

describe('PalletOnGoingReferendaService', () => {
	describe('derivePalletOnGoingReferenda', () => {
		it('throws error for block 13641102', async () => {
			await expect(
				palletsOnGoingReferendaService13641102.derivePalletOnGoingReferenda(blockHash13641102),
			).rejects.toStrictEqual(
				new Error(`The runtime does not include the module 'api.query.referenda' at this block height.`),
			);
		});
		it('works for block 21275366 (Polkadot) & returns 7 referendas, 2 of which are runtime upgrades', async () => {
			expect(
				sanitizeNumbers(await palletsOnGoingReferendaService21275366.derivePalletOnGoingReferenda(blockHash21275366)),
			).toStrictEqual(fetchOnGoingReferenda21275366Response);
		});
	});
});
