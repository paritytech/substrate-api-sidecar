import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../mock';
import { RuntimeMetadataService } from './RuntimeMetadataService';
import * as response789629 from './RuntimeMetadataService789629.json';

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
