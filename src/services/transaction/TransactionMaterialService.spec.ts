import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../mock';
import { TransactionMaterialService } from './TransactionMaterialService';
import * as response789629 from './TransactionMaterialService789629.json';

const transactionMaterialService = new TransactionMaterialService(mockApi);

describe('TransactionMaterialService', () => {
	describe('getTransactionMaterial', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await transactionMaterialService.fetchTransactionMaterial(
						blockHash789629
					)
				)
			).toStrictEqual(response789629);
		});
	});
});
