import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import * as codeResponse from '../test-helpers/responses/runtime/code789629.json';
import { RuntimeCodeService } from './RuntimeCodeService';

const runtimeCodeService = new RuntimeCodeService(mockApi);

describe('RuntimeCodeService', () => {
	describe('fetchCode', () => {
		it('works when ApiPromise works', async () => {
			expect(
				sanitizeNumbers(
					await runtimeCodeService.fetchCode(blockHash789629)
				)
			).toStrictEqual(codeResponse);
		});
	});
});
