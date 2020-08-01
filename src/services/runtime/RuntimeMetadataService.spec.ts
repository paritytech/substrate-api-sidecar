import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import * as response789629 from '../test-helpers/responses/runtime/metadata789629.json';
import { RuntimeMetadataService } from './RuntimeMetadataService';

const runtimeMetadataService = new RuntimeMetadataService(mockApi);

describe('RuntimeMetadataService', () => {
	describe('fetchMetadata', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await runtimeMetadataService.fetchMetadata(blockHash789629)
				)
			).toStrictEqual(response789629);
		});
	});
});
