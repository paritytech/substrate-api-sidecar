import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import { NodeTransactionPoolService } from '.';

const nodeTranstionPoolService = new NodeTransactionPoolService(mockApi);

describe('NodeTransactionPoolService', () => {
	describe('fetchNodeTransactionPool', () => {
		it('works when ApiPromiseWorks', async () => {
			expect(
				sanitizeNumbers(
					await nodeTranstionPoolService.fetchNodeTransactionPool(
						blockHash789629
					)
				)
			).toStrictEqual([]);
		});
	});
});
