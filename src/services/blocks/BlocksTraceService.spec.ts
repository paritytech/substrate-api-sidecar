import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import tracesResponse from '../test-helpers/responses/blocks/traces.json';
import { BlocksTraceService } from './BlocksTraceService';

/**
 * BlocksTraceService mock
 */
const blocksTraceService = new BlocksTraceService(mockApi);

describe('BlocksTraceService', () => {
	it('works when ApiPromise works (Kusama 4403377)', async () => {
		expect(
			sanitizeNumbers(await blocksTraceService.traces(blockHash789629))
		).toStrictEqual(tracesResponse);
	});
});
