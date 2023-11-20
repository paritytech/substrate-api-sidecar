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

import { ApiDecoration } from '@polkadot/api/types';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { kusamRegistryV2025 } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { keyNames } from '../test-helpers/mock/data/getKeyNames';
import operationsResponse from '../test-helpers/responses/blocks/operations.json';
import tracesResponse from '../test-helpers/responses/blocks/traces.json';
import { BlocksTraceService } from './BlocksTraceService';
import { Trace } from './trace';

/**
 * Save the getKeyNames function reference, so we can point it to a different function
 * for testing and then reassign it back to the original after this test suite is done.
 */
const tempGetKeyNames = Trace['getKeyNames'].bind(Trace);

/**
 * HistoricApi used in order to create the correct types per the blocks runtime.
 */
const mockHistoricApi = {
	registry: kusamRegistryV2025,
} as unknown as ApiDecoration<'promise'>;

/**
 * BlocksTraceService mock
 */
const blocksTraceService = new BlocksTraceService(defaultMockApi);

beforeAll(() => {
	Trace['getKeyNames'] = () => keyNames;
});

afterAll(() => {
	// Clean up our test specific overrides
	Trace['getKeyNames'] = tempGetKeyNames;
});

describe('BlocksTraceService', () => {
	describe('BlocksTraceService.traces', () => {
		it('works when ApiPromise works', async () => {
			expect(sanitizeNumbers(await blocksTraceService.traces(blockHash789629))).toStrictEqual(tracesResponse);
		});
	});

	describe('BlocksTraceService.operations', () => {
		it('works when ApiPromise works (without `actions`)', async () => {
			expect(
				sanitizeNumbers(await blocksTraceService.operations(blockHash789629, mockHistoricApi, false)),
			).toMatchObject(operationsResponse);
		});

		it.todo('works when ApiPromise works (with `actions`)');
	});
});
