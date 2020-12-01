import { sanitizeNumbers } from '../../sanitize';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import * as fetchStorageRes from '../test-helpers/responses/pallets/fetchStorage789629.json';
import * as fetchStorageIdsOnlyRes from '../test-helpers/responses/pallets/fetchStorageIdsOnly789629.json';
import { PalletsStorageService } from './PalletsStorageService';

/**
 * Mock PalletsStorageService instance.
 */
const palletsStorageService = new PalletsStorageService(mockApi);

describe('PalletStorageService', () => {
	describe('fetchStorageItem', () => {
		test.todo('works with a query to a single key storage map');
		test.todo('works with a index identifier');
		test.todo('appropriately uses metadata params');
	});

	describe('fetchStorage', () => {
		it('works with no query params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage({
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: false,
					})
				)
			).toStrictEqual(fetchStorageRes);
		});

		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage({
						hash: blockHash789629,
						palletId: '15',
						onlyIds: false,
					})
				)
			).toStrictEqual(fetchStorageRes);
		});

		it('only list storage item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage({
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: true,
					})
				)
			).toStrictEqual(fetchStorageIdsOnlyRes);
		});
	});
});
