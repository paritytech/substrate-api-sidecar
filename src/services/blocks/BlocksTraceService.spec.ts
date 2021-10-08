import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { kusamRegistryV2025 } from '../../test-helpers/registries';
import {
	blockHash789629,
	defaultMockApi,
	mockBlock789629,
} from '../test-helpers/mock';
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
 * Save the refference to the mockBlock789629's registry so we can reassign it back once
 * the tests are over.
 */
const tempMockBlock789629Registry = mockBlock789629.registry;

/**
 * BlocksTraceService mock
 */
const blocksTraceService = new BlocksTraceService(defaultMockApi);

beforeAll(() => {
	// Override registry so we correctly create kusama types.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
	(mockBlock789629 as any).registry = kusamRegistryV2025;
	Trace['getKeyNames'] = () => keyNames;
});

afterAll(() => {
	// Clean up our test specific overrides
	Trace['getKeyNames'] = tempGetKeyNames;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
	(mockBlock789629 as any).registry = tempMockBlock789629Registry;
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
					await blocksTraceService.operations(blockHash789629, false)
				)
			).toMatchObject(operationsResponse);
		});

		it.todo('works when ApiPromise works (with `actions`)');
	});
});
