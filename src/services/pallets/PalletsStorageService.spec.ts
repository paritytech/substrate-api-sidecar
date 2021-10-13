import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';

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

const mockHistoricApi = {
	registry: polkadotRegistry,
	query: {
		democracy: {
			referendumInfoOf: referendumInfoOfAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
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
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: false,
						adjustMetadataV13Arg: true,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});

		it('works with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '15',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: false,
						adjustMetadataV13Arg: true,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});

		it('appropriately uses metadata params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorageItem(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						storageItemId: 'referendumInfoOf',
						key1: '0',
						key2: undefined,
						metadata: true,
						adjustMetadataV13Arg: true,
					})
				)
			).toMatchObject(fetchStorageItemRes);
		});
	});

	describe('fetchStorage', () => {
		it('works with no query params', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: false,
						adjustMetadataV13Arg: true,
					})
				)
			).toStrictEqual(fetchStorageRes);
		});

		it('work with a index identifier', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: '15',
						onlyIds: false,
						adjustMetadataV13Arg: true,
					})
				)
			).toStrictEqual(fetchStorageRes);
		});

		it('only list storage item ids when onlyIds is true', async () => {
			expect(
				sanitizeNumbers(
					await palletsStorageService.fetchStorage(mockHistoricApi, {
						hash: blockHash789629,
						palletId: 'democracy',
						onlyIds: true,
						adjustMetadataV13Arg: true,
					})
				)
			).toStrictEqual(fetchStorageIdsOnlyRes);
		});
	});
});
