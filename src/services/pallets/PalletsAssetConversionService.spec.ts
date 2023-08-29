// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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
import type { Hash } from '@polkadot/types/interfaces';
import { assetHubWestendRegistryV9435 } from '../../test-helpers/registries';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash5236177, mockAssethubWestend } from '../test-helpers/mock';
import { assetConversionEntries } from '../test-helpers/mock/data/assetConversionEntries';
import { PalletsAssetConversionService } from './PalletsAssetConversionService';


const nextPoolAssetIdAt = () =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('Option<u32>', '12')
	);

const assetConversionEntriesAt = () =>
	Promise.resolve().then(() => assetConversionEntries
	);

const mockHistoricApi = {
	registry: assetHubWestendRegistryV9435,
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...mockAssethubWestend,
	at: (_hash: Hash) => mockHistoricApi,
	query: {
		assetConversion: {
			nextPoolAssetId: nextPoolAssetIdAt,
			pools: {
				entries: assetConversionEntriesAt,
			},
		},
	},
} as unknown as ApiPromise;

const palletsAssetConversionService = new PalletsAssetConversionService(
	mockApi
);

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

			const response = await palletsAssetConversionService.fetchNextAvailableId(
				blockHash5236177
			);
			console.log("height {}", response.at.height)

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
				pools:
					[
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '47'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '12'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '1'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '11'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '46'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '10'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '30'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '9'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '32'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '8'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '4'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '7'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '45'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '6'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '2',
									interior: {
										X1: [
											{
												globalConsensus: 'Polkadot'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '5'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '2511'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '4'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '19801204'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '3'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: 0,
									interior: {
										X2: [
											{
												palletInstance: '50'
											},
											{
												generalIndex: '1114'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '2'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '0',
									interior: {
										X2: [
											{
												palletInstance: '50',
											},
											{
												generalIndex: '8'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '1'
							}
						},
						{
							reserves: [
								{
									parents: '0',
									interior: {
										here: ''
									}
								},
								{
									parents: '2',
									interior: {
										X1: [
											{
												globalConsensus: 'Polkadot'
											}
										]
									}
								}
							],
							lpToken: {
								lpToken: '0'
							}
						},
					]
			};

			const response = await palletsAssetConversionService.fetchLiquidityPools(
				blockHash5236177
			);

			expect(sanitizeNumbers(response.pools)).toStrictEqual(expectedResponse.pools);
		});
	});
});
