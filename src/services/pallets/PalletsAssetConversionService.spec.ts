// Copyright 2017-2024 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import { StorageEntryBase } from '@polkadot/api/types';
import { StorageKey } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import type { Hash } from '@polkadot/types/interfaces';
import type { StagingXcmV3MultiLocation } from '@polkadot/types/lookup';
import { Codec } from '@polkadot/types/types';
import type { ITuple } from '@polkadot/types-codec/types';
import { Observable } from 'rxjs';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { assetHubWestendMetadataRpcV9435 } from '../../test-helpers/metadata/assetHubWestendMetadata';
import { assetHubWestendRegistryV9435 } from '../../test-helpers/registries/assetHubWestendRegistry';
import { createApiWithAugmentations } from '../../test-helpers/typeFactory';
import { blockHash5236177, mockAssetHubWestendApi } from '../test-helpers/mock';
import { reserves } from '../test-helpers/mock/data/assetConversionEntries';
import { PalletsAssetConversionService } from './PalletsAssetConversionService';

const assetHubWestendApi = createApiWithAugmentations(assetHubWestendMetadataRpcV9435);

type StorageEntryFunction = (arg1: [StagingXcmV3MultiLocation, StagingXcmV3MultiLocation]) => Observable<Codec>;

function key(
	multilocation: [StagingXcmV3MultiLocation, StagingXcmV3MultiLocation],
	storageEntry: StorageEntryBase<'promise', StorageEntryFunction>,
): StorageKey<[ITuple<[StagingXcmV3MultiLocation, StagingXcmV3MultiLocation]>]> {
	const native = multilocation[0];
	const asset = multilocation[1];
	const id: [StagingXcmV3MultiLocation, StagingXcmV3MultiLocation] = [native, asset];
	const key: StorageKey<[ITuple<[StagingXcmV3MultiLocation, StagingXcmV3MultiLocation]>]> = new StorageKey(
		assetHubWestendRegistryV9435,
		storageEntry.key(id),
	);

	return key.setMeta(storageEntry.creator.meta);
}

const poolId0 = key(reserves[12], assetHubWestendApi.query.assetConversion.pools);
const poolId1 = key(reserves[11], assetHubWestendApi.query.assetConversion.pools);
const poolId2 = key(reserves[10], assetHubWestendApi.query.assetConversion.pools);
const poolId3 = key(reserves[9], assetHubWestendApi.query.assetConversion.pools);

const poolId4 = key(reserves[8], assetHubWestendApi.query.assetConversion.pools);
const poolId5 = key(reserves[7], assetHubWestendApi.query.assetConversion.pools);
const poolId6 = key(reserves[6], assetHubWestendApi.query.assetConversion.pools);
const poolId7 = key(reserves[5], assetHubWestendApi.query.assetConversion.pools);
const poolId8 = key(reserves[4], assetHubWestendApi.query.assetConversion.pools);
const poolId9 = key(reserves[3], assetHubWestendApi.query.assetConversion.pools);
const poolId10 = key(reserves[2], assetHubWestendApi.query.assetConversion.pools);
const poolId11 = key(reserves[1], assetHubWestendApi.query.assetConversion.pools);
const poolId12 = key(reserves[0], assetHubWestendApi.query.assetConversion.pools);

const poolEntries = () =>
	Promise.resolve().then(() => {
		const options: Option<Codec>[] = [];
		for (let i = 13; i > 0; i--) {
			options.push(assetHubWestendRegistryV9435.createType('Option<u32>', i - 1));
		}
		const entries = [
			[poolId12, { lpToken: options[0] }],
			[poolId11, { lpToken: options[1] }],
			[poolId10, { lpToken: options[2] }],
			[poolId9, { lpToken: options[3] }],
			[poolId8, { lpToken: options[4] }],
			[poolId7, { lpToken: options[5] }],
			[poolId6, { lpToken: options[6] }],
			[poolId5, { lpToken: options[7] }],
			[poolId4, { lpToken: options[8] }],
			[poolId3, { lpToken: options[9] }],
			[poolId2, { lpToken: options[10] }],
			[poolId1, { lpToken: options[11] }],
			[poolId0, { lpToken: options[12] }],
		];

		return entries;
	});

const nextPoolAssetIdAt = () =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Option<u32>', '12'));

const mockHistoricApi = {
	registry: assetHubWestendRegistryV9435,
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...mockAssetHubWestendApi,
	at: (_hash: Hash) => mockHistoricApi,
	query: {
		assetConversion: {
			nextPoolAssetId: nextPoolAssetIdAt,
			pools: {
				entries: poolEntries,
			},
		},
	},
} as unknown as ApiPromise;

const palletsAssetConversionService = new PalletsAssetConversionService(mockApi);

describe('PalletsAssetConversionService', () => {
	describe('PalletsAssetConversionService.fetchNextAvailableId', () => {
		it('Should return the correct response for a LiquidityPoolId', async () => {
			const expectedResponse = {
				at: {
					hash: '0x270c4262eacfd16f05a63ef36eeabf165abbc3a4c53d0480f5460e6d5b2dc8b5',
					height: '5236177',
				},
				poolId: '12',
			};

			const response = await palletsAssetConversionService.fetchNextAvailableId(blockHash5236177);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
	describe('PalletsAssetConversionService.fetchLiquidityPools', () => {
		it('Should return the correct response for the existing assetPools', async () => {
			const expectedResponse = {
				at: {
					hash: '0x270c4262eacfd16f05a63ef36eeabf165abbc3a4c53d0480f5460e6d5b2dc8b5',
					height: '5236177',
				},
				pools: [
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '47',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '12',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '1',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '11',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '46',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '10',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '30',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '9',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '32',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '8',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '4',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '7',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '45',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '6',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '2',
								interior: {
									x1: {
										globalConsensus: { polkadot: null },
									},
								},
							},
						],
						lpToken: {
							lpToken: '5',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '2511',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '4',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '19801204',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '3',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '1114',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '2',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '0',
								interior: {
									x2: [
										{
											palletInstance: '50',
										},
										{
											generalIndex: '8',
										},
									],
								},
							},
						],
						lpToken: {
							lpToken: '1',
						},
					},
					{
						reserves: [
							{
								parents: '0',
								interior: {
									here: null,
								},
							},
							{
								parents: '2',
								interior: {
									x1: {
										globalConsensus: { polkadot: null },
									},
								},
							},
						],
						lpToken: {
							lpToken: '0',
						},
					},
				],
			};

			const response = await palletsAssetConversionService.fetchLiquidityPools(blockHash5236177);

			expect(sanitizeNumbers(response.pools)).toStrictEqual(expectedResponse.pools);
		});
	});
});
