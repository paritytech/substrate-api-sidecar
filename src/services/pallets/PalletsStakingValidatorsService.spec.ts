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

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import type { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9370 } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { validatorsEntries } from '../test-helpers/mock/data/validator14815152Entries';
import { validators14815152Hex } from '../test-helpers/mock/data/validators14815152Hex';
import fetchValidators14815152 from '../test-helpers/responses/pallets/fetchValidators14815152.json';
import { PalletsStakingValidatorsService } from './PalletsStakingValidatorsService';

const validatorsAt = () =>
	Promise.resolve().then(() => polkadotRegistryV9370.createType('Vec<AccountId32>', validators14815152Hex));

const validatorsEntriesAt = () => Promise.resolve().then(() => validatorsEntries());

const mockHistoricApi = {
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

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;
/**
 * Mock PalletStakingProgressService instance.
 */
const palletsStakingValidatorsService = new PalletsStakingValidatorsService(mockApi);

describe('PalletsStakingValidatorsService', () => {
	describe('derivePalletStakingValidators', () => {
		it('Works for block 14815152', async () => {
			expect(
				sanitizeNumbers(
					// The inputted blockHash does not change the tests since the mocked data is all based
					// on block 14815152
					await palletsStakingValidatorsService.derivePalletStakingValidators(blockHash789629),
				),
			).toStrictEqual(fetchValidators14815152);
		});
	});
});
