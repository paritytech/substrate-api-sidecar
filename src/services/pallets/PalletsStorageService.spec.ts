import { ApiPromise } from '@polkadot/api';

import { sanitizeNumbers } from '../../sanitize';
import { polkadotRegistry } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import fetchStorageRes from '../test-helpers/responses/pallets/fetchStorage789629.json';
import fetchStorageIdsOnlyRes from '../test-helpers/responses/pallets/fetchStorageIdsOnly789629.json';
import fetchStorageItemRes from '../test-helpers/responses/pallets/fetchStorageItem789629.json';
import { PalletsStorageService } from './PalletsStorageService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistry.createType('ReferendumInfo');
	});

const mockApi = {
	...defaultMockApi,
	query: {
		democracy: {
			referendumInfoOf: { at: referendumInfoOfAt },
		},
	},
} as unknown as ApiPromise;

/**
 * Mock PalletsStorageService instance.
 */
const palletsStorageService = new PalletsStorageService(mockApi);

describe('PalletStorageService', () => {
	describe('fetchStorageItem', () => {
		it('works with a query to a single key storage map', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem({
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: false,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});

		it('works with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem({
						hash: blockHash789629,
						palletId: '15',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: false,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem({
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: true,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});
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
