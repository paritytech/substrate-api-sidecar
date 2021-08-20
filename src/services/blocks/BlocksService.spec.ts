import { ApiPromise } from '@polkadot/api';
import { AugmentedConst } from '@polkadot/api/types/consts';
import { RpcPromiseResult } from '@polkadot/api/types/rpc';
import { GenericExtrinsic } from '@polkadot/types';
import { GenericCall } from '@polkadot/types/generic';
import {
	BalanceOf,
	BlockHash,
	Hash,
	SignedBlock,
} from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';
import LRU from 'lru-cache';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { createCall } from '../../test-helpers/createCall';
import {
	polkadotMetadata,
	polkadotMetadataV29,
} from '../../test-helpers/metadata/metadata';
import {
	kusamaRegistry,
	polkadotRegistry,
	polkadotRegistryV29,
} from '../../test-helpers/registries';
import { ExtBaseWeightValue, PerClassValue } from '../../types/chains-config';
import { IBlock, IExtrinsic } from '../../types/responses/';
import {
	blockHash20000,
	blockHash100000,
	blockHash789629,
	mockApi,
	mockBlock789629,
	mockForkedBlock789629,
} from '../test-helpers/mock';
import block789629 from '../test-helpers/mock/data/block789629.json';
import { parseNumberOrThrow } from '../test-helpers/mock/parseNumberOrThrow';
import block789629Extrinsic from '../test-helpers/responses/blocks/block789629Extrinsic.json';
import blocks789629Response from '../test-helpers/responses/blocks/blocks789629.json';
import { BlocksService } from './BlocksService';

/**
 * For type casting mock getBlock functions so tsc does not complain
 */
type GetBlock = RpcPromiseResult<
	(hash?: string | BlockHash | Uint8Array | undefined) => Promise<SignedBlock>
>;

/**
 * Interface for the reponse in `fetchBlock` test suite
 */
interface ResponseObj {
	extrinsics: IExtrinsic[];
}

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
			};

			expect(
				sanitizeNumbers(
					await blocksService.fetchBlock(blockHash789629, options)
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
			};
			const tempGetBlock = mockApi.derive.chain.getBlock;
			mockApi.derive.chain.getBlock = (() =>
				Promise.resolve().then(() => {
					return {
						block: mockBlock789629BadExt,
					};
				}) as unknown) as GetBlock;

			await expect(
				blocksService.fetchBlock(blockHash789629, options)
			).rejects.toThrow(
				new Error(
					`Cannot destructure property 'method' of 'extrinsic' as it is undefined.`
				)
			);

			mockApi.derive.chain.getBlock = tempGetBlock as unknown as GetBlock;
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
			};

			const block = await blocksService.fetchBlock(blockHash789629, options);

			expect(block.finalized).toEqual(undefined);
		});

		it('Return an error with a null calcFee when perByte is undefined', async () => {
			mockApi.consts.transactionPayment.transactionByteFee =
				undefined as unknown as BalanceOf & AugmentedConst<'promise'>;

			const configuredBlocksService = new BlocksService(mockApi, 0, new LRU());

			// fetchBlock options
			const options = {
				eventDocs: true,
				extrinsicDocs: true,
				checkFinalized: false,
				queryFinalizedHead: false,
				omitFinalizedTag: false,
			};

			const response = sanitizeNumbers(
				await configuredBlocksService.fetchBlock(blockHash789629, options)
			);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const responseObj: ResponseObj = JSON.parse(JSON.stringify(response));

			// Revert mockApi back to its original setting that was changed above.
			mockApi.consts.transactionPayment.transactionByteFee =
				polkadotRegistry.createType('Balance', 1000000) as BalanceOf &
					AugmentedConst<'promise'>;

			expect(responseObj.extrinsics[3].info).toEqual({
				error: 'Fee calculation not supported for 16#polkadot',
			});
		});
	});

	describe('createCalcFee & calc_fee', () => {
		it('calculates partialFee for proxy.proxy in polkadot block 789629', async () => {
			// Reset LRU cache
			cache.reset();
			// tx hash: 0x6d6c0e955650e689b14fb472daf14d2bdced258c748ded1d6cb0da3bfcc5854f
			const { calcFee } = await blocksService['createCalcFee'](
				mockApi,
				'0xParentHash' as unknown as Hash,
				mockBlock789629
			);

			expect(calcFee?.calc_fee(BigInt(399480000), 534, BigInt(125000000))).toBe(
				'544000000'
			);
		});

		it('calculates partialFee for utility.batch in polkadot block 789629', async () => {
			// Reset LRU cache
			cache.reset();
			// tx hash: 0xc96b4d442014fae60c932ea50cba30bf7dea3233f59d1fe98c6f6f85bfd51045
			const { calcFee } = await blocksService['createCalcFee'](
				mockApi,
				'0xParentHash' as unknown as Hash,
				mockBlock789629
			);

			expect(
				calcFee?.calc_fee(BigInt(941325000000), 1247, BigInt(125000000))
			).toBe('1257000075');
		});

		it('Should store a new runtime specific extrinsicBaseWeight when it doesnt exist', async () => {
			// Reset LRU cache
			cache.reset();

			const blocksServiceEmptyBlockStore = new BlocksService(mockApi, 0, cache);

			(mockApi.runtimeVersion.specVersion as unknown) =
				polkadotRegistry.createType('u32', 20);
			(mockApi.runtimeVersion.specName as unknown) =
				polkadotRegistry.createType('Text', 'westend');

			await blocksServiceEmptyBlockStore['createCalcFee'](
				mockApi,
				'0xParentHash' as unknown as Hash,
				mockBlock789629
			);

			expect(blocksServiceEmptyBlockStore['blockWeightStore'][20]).toBeTruthy();

			(mockApi.runtimeVersion.specVersion as unknown) =
				polkadotRegistry.createType('u32', 16);
			(mockApi.runtimeVersion.specName as unknown) =
				polkadotRegistry.createType('Text', 'polkadot');
		});
	});

	describe('BlocksService.getWeight', () => {
		const blockHash = polkadotRegistry.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
		);

		it('Should return correct `extrinsicBaseWeight`', async () => {
			// Reset LRU cache
			cache.reset();

			const weightValue = await blocksService['getWeight'](mockApi, blockHash);

			expect(
				(weightValue as unknown as ExtBaseWeightValue).extrinsicBaseWeight
			).toBe(BigInt(125000000));
		});

		it('Should return correct `blockWeights`', async () => {
			// Reset LRU cache
			cache.reset();

			const changeMetadataToV29 = () =>
				Promise.resolve().then(() => polkadotMetadataV29);
			const revertedMetadata = () =>
				Promise.resolve().then(() => polkadotMetadata);

			(mockApi.registry as unknown) = polkadotRegistryV29;
			(mockApi.rpc.state.getMetadata as unknown) = changeMetadataToV29;

			const weightValue = await blocksService['getWeight'](mockApi, blockHash);

			expect(
				(weightValue as unknown as PerClassValue).perClass.normal.baseExtrinsic
			).toBe(BigInt(125000000));
			expect(
				(weightValue as unknown as PerClassValue).perClass.operational
					.baseExtrinsic
			).toBe(BigInt(1));
			expect(
				(weightValue as unknown as PerClassValue).perClass.mandatory
					.baseExtrinsic
			).toBe(BigInt(512000000000001));

			(mockApi.registry as unknown) = polkadotRegistry;
			(mockApi.rpc.state.getMetadata as unknown) = revertedMetadata;
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
					mockBlock789629.registry
				)
			).toThrow());

		it('parses a simple balances.transfer', () => {
			expect(
				JSON.stringify(
					blocksService['parseGenericCall'](transfer, mockBlock789629.registry)
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
					blocksService['parseGenericCall'](batch4, mockBlock789629.registry)
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
					blocksService['parseGenericCall'](batch, mockBlock789629.registry)
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
		};

		it('Returns the correct extrinisics object for block 789629', async () => {
			// Reset LRU cache
			cache.reset();

			const block = await blocksService.fetchBlock(blockHash789629, options);

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

			const block = await blocksService.fetchBlock(blockHash789629, options);

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
							'0x45424142',
							'0x036d000000f4f4d80f00000000ec9bd8e2d0368c97f3d888837f7283bbe08266869eb613159db547905026c2502a70f168b9ffcc233344005d11ebecd166769200d270a2eaa642118a00acb708a0487a440b0caf3dd5c91ab173e80ddfe5735ef8b938ea87a6105a1161612707',
						],
					},
					{
						seal: [
							'0x45424142',
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
		};

		it('Should correctly store the most recent queried blocks', async () => {
			// Reset LRU cache
			cache.reset();

			await blocksService.fetchBlock(blockHash789629, options);
			await blocksService.fetchBlock(blockHash20000, options);

			expect(cache.length).toBe(2);
		});

		it('Should have a max of 2 blocks within the LRUcache, and should save the most recent and remove the oldest block', async () => {
			// Reset LRU cache
			cache.reset();

			await blocksService.fetchBlock(blockHash789629, options);
			await blocksService.fetchBlock(blockHash20000, options);
			await blocksService.fetchBlock(blockHash100000, options);

			expect(cache.get(blockHash789629.toString())).toBe(undefined);
			expect(cache.length).toBe(2);
		});
	});
});
