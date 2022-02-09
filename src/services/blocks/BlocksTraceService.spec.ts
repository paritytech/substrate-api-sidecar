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
			expect(
				sanitizeNumbers(await blocksTraceService.traces(blockHash789629))
			).toStrictEqual(tracesResponse);
		});
	});

	describe('BlocksTraceService.operations', () => {
		it('works when ApiPromise works (without `actions`)', async () => {
			expect(
				sanitizeNumbers(
					await blocksTraceService.operations(
						blockHash789629,
						mockHistoricApi,
						false
					)
				)
			).toMatchObject(operationsResponse);
		});

		it.todo('works when ApiPromise works (with `actions`)');
	});
});
