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

import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { blockHash13641102, defaultMockApi } from '../test-helpers/mock';
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
const palletsOnGoingReferendaService = new PalletsOnGoingReferendaService(mockApi);

describe('PalletOnGoingReferendaService', () => {
	describe('derivePalletOnGoingReferenda', () => {
		it('throws error for block 13641102', async () => {
			await expect(
				palletsOnGoingReferendaService.derivePalletOnGoingReferenda(blockHash13641102),
			).rejects.toStrictEqual(
				new Error(`The runtime does not include the module 'api.query.referenda' at this block height.`),
			);
		});
	});
});
