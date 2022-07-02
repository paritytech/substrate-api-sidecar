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
import { ApiDecoration } from '@polkadot/api/types';
import { PromiseRpcResult } from '@polkadot/api-base/types/rpc';
import { GenericExtrinsic } from '@polkadot/types';
import { GenericCall } from '@polkadot/types/generic';
import { BlockHash, Hash, SignedBlock } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';
import LRU from 'lru-cache';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { createCall } from '../../test-helpers/createCall';
import {
	kusamaRegistry,
	polkadotRegistry,
} from '../../test-helpers/registries';
import { IBlock, ISanitizedEvent } from '../../types/responses/';
import {
	blockHash20000,
	blockHash100000,
	blockHash789629,
	defaultMockApi,
	mockForkedBlock789629,
} from '../test-helpers/mock';
import block789629 from '../test-helpers/mock/data/block789629.json';
import { events789629 } from '../test-helpers/mock/data/events789629Hex';
import {
	balancesDepositEvent,
	constructEvent,
	treasuryEvent,
	withdrawEvent,
} from '../test-helpers/mock/data/mockEventData';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import { parseNumberOrThrow } from '../test-helpers/mock/parseNumberOrThrow';
import block789629Extrinsic from '../test-helpers/responses/blocks/block789629Extrinsic.json';
import blocks789629Response from '../test-helpers/responses/blocks/blocks789629.json';
import { BlocksService } from './BlocksService';

const validatorsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<ValidatorId>', validators789629Hex)
	);

const eventsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<EventRecord>', events789629)
	);

const nextFeeMultiplierAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Fixed128', 1000000000)
	);

const mockHistoricApi = {
	registry: polkadotRegistry,
	consts: {
		transactionPayment: {
			transactionByteFee: polkadotRegistry.createType('Balance', 1000000),
			weightToFee: [
				{
					coeffFrac: polkadotRegistry.createType('Perbill', 80000000),
					coeffInteger: polkadotRegistry.createType('Balance', 0),
					degree: polkadotRegistry.createType('u8', 1),
					negative: false,
				},
			],
		},
		system: {
			extrinsicBaseWeight: polkadotRegistry.createType('u64', 125000000),
		},
	},
	query: {
		session: {
			validators: validatorsAt,
		},
		system: {
			events: eventsAt,
		},
		transactionPayment: {
			nextFeeMultiplier: nextFeeMultiplierAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	query: {
		transactionPayment: {
			nextFeeMultiplier: { at: nextFeeMultiplierAt },
		},
	},
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

/**
 * For type casting mock getBlock functions so tsc does not complain
 */
type GetBlock = PromiseRpcResult<
	(hash?: string | BlockHash | Uint8Array | undefined) => Promise<SignedBlock>
>;

// LRU cache used to cache blocks
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const cache = new LRU({ max: 2 }) as LRU<string, IBlock>;

// Block Service
const blocksService = new BlocksService(mockApi, 0, cache);

describe('BlocksService', () => {
	describe('fetchBlock', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			// Reset LRU cache
			cache.reset();

			// fetchBlock options
			const options = {
				eventDocs: true,
				extrinsicDocs: true,
				checkFinalized: false,
				queryFinalizedHead: false,
				omitFinalizedTag: false,
				getFeeByEvent: false,
			};

			expect(
				sanitizeNumbers(
					await blocksService.fetchBlock(
						blockHash789629,
						mockHistoricApi,
						options
					)
				)
			).toMatchObject(blocks789629Response);
		});

		it('throws when an extrinsic is undefined', async () => {
			// Reset LRU cache
			cache.reset();
			// Create a block with undefined as the first extrinisic and the last extrinsic removed
			const mockBlock789629BadExt = polkadotRegistry.createType(
				'Block',
				block789629
			);

			mockBlock789629BadExt.extrinsics.pop();

			mockBlock789629BadExt.extrinsics.unshift(
				undefined as unknown as GenericExtrinsic
			);

			// fetchBlock Options
			const options = {
				eventDocs: false,
				extrinsicDocs: false,
				checkFinalized: false,
				queryFinalizedHead: false,
				omitFinalizedTag: false,
				getFeeByEvent: false,
			};
			const tempGetBlock = mockApi.rpc.chain.getBlock;
			mockApi.rpc.chain.getBlock = (() =>
				Promise.resolve().then(() => {
					return {
						block: mockBlock789629BadExt,
					};
				}) as unknown) as GetBlock;

			await expect(
				blocksService.fetchBlock(blockHash789629, mockHistoricApi, options)
			).rejects.toThrowError(TypeError);

			mockApi.rpc.chain.getBlock = tempGetBlock as unknown as GetBlock;
		});

		it('Returns the finalized tag as undefined when omitFinalizedTag equals true', async () => {
			// Reset LRU cache
			cache.reset();
			// fetchBlock options
			const options = {
				eventDocs: true,
				extrinsicDocs: true,
				checkFinalized: false,
				queryFinalizedHead: false,
				omitFinalizedTag: true,
				getFeeByEvent: false,
			};

			const block = await blocksService.fetchBlock(
				blockHash789629,
				mockHistoricApi,
				options
			);

			expect(block.finalized).toEqual(undefined);
		});
	});

	describe('BlocksService.parseGenericCall', () => {
		// Reset LRU cache
		cache.reset();

		const transfer = createCall('balances', 'transfer', {
			value: 12,
			dest: kusamaRegistry.createType(
				'AccountId',
				'14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'
			), // Bob
		});

		const transferOutput = {
			method: {
				pallet: 'balances',
				method: 'transfer',
			},
			args: {
				dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
				value: 12,
			},
		};

		it('does not handle an empty object', () =>
			expect(() =>
				blocksService['parseGenericCall'](
					{} as unknown as GenericCall,
					mockHistoricApi.registry
				)
			).toThrow());

		it('parses a simple balances.transfer', () => {
			expect(
				JSON.stringify(
					blocksService['parseGenericCall'](transfer, mockHistoricApi.registry)
				)
			).toBe(JSON.stringify(transferOutput));
		});

		it('parses utility.batch nested 4 deep', () => {
			const batch1 = createCall('utility', 'batch', {
				calls: [transfer],
			});

			const batch2 = createCall('utility', 'batch', {
				calls: [batch1, transfer],
			});

			const batch3 = createCall('utility', 'batch', {
				calls: [batch2, transfer],
			});

			const batch4 = createCall('utility', 'batch', {
				calls: [batch3, transfer],
			});

			const baseBatch = {
				method: {
					pallet: 'utility',
					method: 'batch',
				},
				args: {
					calls: [],
				},
			};

			expect(
				JSON.stringify(
					blocksService['parseGenericCall'](batch4, mockHistoricApi.registry)
				)
			).toBe(
				JSON.stringify({
					...baseBatch,
					args: {
						calls: [
							{
								...baseBatch,
								args: {
									calls: [
										{
											...baseBatch,
											args: {
												calls: [
													{
														...baseBatch,
														args: {
															calls: [transferOutput],
														},
													},
													transferOutput,
												],
											},
										},
										transferOutput,
									],
								},
							},
							transferOutput,
						],
					},
				})
			);
		});

		it('handles a batch transfer correctly', () => {
			const proxy = createCall('proxy', 'proxy', {
				forceProxyType: 'Any',
				call: transfer,
			});

			const batch = createCall('utility', 'batch', {
				calls: [proxy, proxy],
			});

			const proxyCall = {
				method: {
					pallet: 'proxy',
					method: 'proxy',
				},
				args: {
					real: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
					force_proxy_type: 'Any',
					call: transferOutput,
				},
			};

			expect(
				JSON.stringify(
					blocksService['parseGenericCall'](batch, mockHistoricApi.registry)
				)
			).toEqual(
				JSON.stringify({
					method: {
						pallet: 'utility',
						method: 'batch',
					},
					args: {
						calls: [proxyCall, proxyCall],
					},
				})
			);
		});
	});

	describe('BlockService.isFinalizedBlock', () => {
		const finalizedHead = polkadotRegistry.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
		);

		const blockNumber = polkadotRegistry.createType(
			'Compact<BlockNumber>',
			789629
		);

		it('Returns false when queried blockId is not canonical', async () => {
			// Reset LRU cache
			cache.reset();

			const getHeader = (_hash: Hash) =>
				Promise.resolve().then(() => mockForkedBlock789629.header);

			const getBlockHash = (_zero: number) =>
				Promise.resolve().then(() => finalizedHead);

			const forkMockApi = {
				rpc: {
					chain: {
						getHeader,
						getBlockHash,
					},
				},
			} as ApiPromise;

			const queriedHash = polkadotRegistry.createType(
				'BlockHash',
				'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578'
			);

			expect(
				await blocksService['isFinalizedBlock'](
					forkMockApi,
					blockNumber,
					queriedHash,
					finalizedHead,
					true
				)
			).toEqual(false);
		});

		it('Returns true when queried blockId is canonical', async () => {
			const blocksService = new BlocksService(mockApi, 0, new LRU());
			expect(
				await blocksService['isFinalizedBlock'](
					mockApi,
					blockNumber,
					finalizedHead,
					finalizedHead,
					true
				)
			).toEqual(true);
		});
	});

	describe('fetchExrinsicByIndex', () => {
		// fetchBlock options
		const options = {
			eventDocs: false,
			extrinsicDocs: false,
			checkFinalized: false,
			queryFinalizedHead: false,
			omitFinalizedTag: false,
			getFeeByEvent: false,
		};

		it('Returns the correct extrinisics object for block 789629', async () => {
			// Reset LRU cache
			cache.reset();

			const block = await blocksService.fetchBlock(
				blockHash789629,
				mockHistoricApi,
				options
			);

			/**
			 * The `extrinsicIndex` (second param) is being tested for a non-zero
			 * index here.
			 */
			const extrinsic = blocksService['fetchExtrinsicByIndex'](block, 2);

			expect(JSON.stringify(sanitizeNumbers(extrinsic))).toEqual(
				JSON.stringify(block789629Extrinsic)
			);
		});

		it("Throw an error when `extrinsicIndex` doesn't exist", async () => {
			// Reset LRU cache
			cache.reset();

			const block = await blocksService.fetchBlock(
				blockHash789629,
				mockHistoricApi,
				options
			);

			expect(() => {
				blocksService['fetchExtrinsicByIndex'](block, 5);
			}).toThrow(new BadRequest('Requested `extrinsicIndex` does not exist'));
		});

		it('Throw an error when param `extrinsicIndex` is less than 0', () => {
			expect(() => {
				parseNumberOrThrow(
					'-5',
					'`exstrinsicIndex` path param is not a number'
				);
			}).toThrow(
				new BadRequest('`exstrinsicIndex` path param is not a number')
			);
		});
	});

	describe('fetchBlockSummary', () => {
		const expectedResponse = {
			parentHash:
				'0x205da5dba43bbecae52b44912249480aa9f751630872b6b6ba1a9d2aeabf0177',
			number: '789629',
			stateRoot:
				'0x023b5bb1bc10a1a91a9ef683f46a8bb09666c50476d5592bd6575a73777eb173',
			extrinsicsRoot:
				'0x4c1d65bf6b57086f00d5df40aa0686ffbc581ef60878645613b1fc3303de5030',
			digest: {
				logs: [
					{
						preRuntime: [
							'0x42414245',
							'0x036d000000f4f4d80f00000000ec9bd8e2d0368c97f3d888837f7283bbe08266869eb613159db547905026c2502a70f168b9ffcc233344005d11ebecd166769200d270a2eaa642118a00acb708a0487a440b0caf3dd5c91ab173e80ddfe5735ef8b938ea87a6105a1161612707',
						],
					},
					{
						seal: [
							'0x42414245',
							'0xae78514e1de84a7d32e55b9b652f9d408ab1f7b4bfdbf6b2fad9cad94a91b86b0161cabf08f5ae1d3a1aa4993e2d96d56c94b03cee0898ccb8385a546084f88b',
						],
					},
				],
			},
		};
		it('Returns the correct summary for the latest block', async () => {
			// Reset LRU cache
			cache.reset();

			const blockSummary = await blocksService.fetchBlockHeader(
				blockHash789629
			);

			expect(sanitizeNumbers(blockSummary)).toStrictEqual(expectedResponse);
		});

		it('Returns the correct summary for the given block number', async () => {
			// Reset LRU cache
			cache.reset();

			const blockSummary = await blocksService.fetchBlockHeader();

			expect(sanitizeNumbers(blockSummary)).toStrictEqual(expectedResponse);
		});
	});

	describe('Block LRUcache', () => {
		// fetchBlock options
		const options = {
			eventDocs: true,
			extrinsicDocs: true,
			checkFinalized: false,
			queryFinalizedHead: false,
			omitFinalizedTag: false,
			getFeeByEvent: false,
		};

		it('Should correctly store the most recent queried blocks', async () => {
			// Reset LRU cache
			cache.reset();

			await blocksService.fetchBlock(blockHash789629, mockHistoricApi, options);
			await blocksService.fetchBlock(blockHash20000, mockHistoricApi, options);

			expect(cache.length).toBe(2);
		});

		it('Should have a max of 2 blocks within the LRUcache, and should save the most recent and remove the oldest block', async () => {
			// Reset LRU cache
			cache.reset();

			await blocksService.fetchBlock(blockHash789629, mockHistoricApi, options);
			await blocksService.fetchBlock(blockHash20000, mockHistoricApi, options);
			await blocksService.fetchBlock(blockHash100000, mockHistoricApi, options);

			expect(cache.get(blockHash789629.toString())).toBe(undefined);
			expect(cache.length).toBe(2);
		});
	});

	describe('FeeByEvent', () => {
		describe('getPartialFeeByEvents', () => {
			const partialFee = polkadotRegistry.createType('Balance', '2490128143');
			const expectedResponse = { partialFee: '2490128143' };

			it('Should retrieve the correct fee for balances::withdraw events', () => {
				const response = blocksService['getPartialFeeByEvents'](
					withdrawEvent,
					partialFee
				);

				expect(response).toStrictEqual(expectedResponse);
			});

			it('Should retrieve the correct fee for treasury::deposit events', () => {
				const response = blocksService['getPartialFeeByEvents'](
					treasuryEvent,
					partialFee
				);

				expect(response).toStrictEqual(expectedResponse);
			});

			it('Should retrieve the correct fee for balances::deposit events', () => {
				const response = blocksService['getPartialFeeByEvents'](
					balancesDepositEvent,
					partialFee
				);

				expect(response).toStrictEqual(expectedResponse);
			});

			it('Should error correctly when there is no fee in the events', () => {
				const expectedResponseWithError = {
					...expectedResponse,
					error: 'Could not find a reliable fee within the events data.',
				};
				const emptyArray = [] as unknown as ISanitizedEvent[];
				const response = blocksService['getPartialFeeByEvents'](
					emptyArray,
					partialFee
				);

				expect(response).toStrictEqual(expectedResponseWithError);
			});
		});

		describe('getPartialFeeInfo', () => {
			const mockEvent = [
				constructEvent('balances', 'Withdraw', ['0x', '149000011']),
			];

			it('Should correctly handle `getEventByFee` when true', async () => {
				const response = await blocksService['getPartialFeeInfo'](
					mockEvent,
					'0x',
					blockHash789629,
					true
				);

				expect(sanitizeNumbers(response)).toStrictEqual({
					dispatchClass: 'Normal',
					partialFee: '149000011',
					error: undefined,
				});
			});

			it('Should correctly handle `getEventByFee` when false', async () => {
				const response = await blocksService['getPartialFeeInfo'](
					mockEvent,
					'0x',
					blockHash789629,
					false
				);

				expect(sanitizeNumbers(response)).toStrictEqual({
					dispatchClass: 'Normal',
					partialFee: '149000000',
					error: undefined,
				});
			});
		});
	});
});
