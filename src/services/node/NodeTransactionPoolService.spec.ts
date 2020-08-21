import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import { NodeTransactionPoolService } from '.';

const nodeTranstionPoolService = new NodeTransactionPoolService(mockApi);

describe('NodeTransactionPoolService', () => {
	describe('fetchTransactionPool', () => {
		it('works when ApiPromiseWorks', async () => {
			expect(
				sanitizeNumbers(
					await nodeTranstionPoolService.fetchTransactionPool(
						blockHash789629
					)
				)
			).toStrictEqual([]);
		});
	});
});
