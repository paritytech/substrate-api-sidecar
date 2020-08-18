import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import * as response789629 from '../test-helpers/responses/transaction/material789629.json';
import { TransactionMaterialService } from './TransactionMaterialService';

const transactionMaterialService = new TransactionMaterialService(mockApi);

describe('TransactionMaterialService', () => {
	describe('getTransactionMaterial', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await transactionMaterialService.fetchTransactionMaterial(
						blockHash789629,
						false
					)
				)
			).toStrictEqual(response789629);
		});
	});
});
