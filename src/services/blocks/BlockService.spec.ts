/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiPromise } from '@polkadot/api';
import { GenericCall } from '@polkadot/types/generic';
import { Block, Hash } from '@polkadot/types/interfaces';

import { createCall, kusamaRegistry } from '../../utils/testTools';
import { BlocksService } from './BlocksService';

const transfer = createCall('balances', 'transfer', {
	value: 12,
	dest: kusamaRegistry.createType(
		'AccountId',
		'14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'
	), // Bob
});

const transferOutput = {
	method: 'balances.transfer',
	callIndex: new Uint8Array([6, 0]),
	args: {
		dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
		value: 12,
	},
};

// from polkadot
const header789629 = {
	parentHash:
		'0x205da5dba43bbecae52b44912249480aa9f751630872b6b6ba1a9d2aeabf0177',
	number: 789629,
	stateRoot:
		'0x023b5bb1bc10a1a91a9ef683f46a8bb09666c50476d5592bd6575a73777eb173',
	extrinsicsRoot:
		'0x4c1d65bf6b57086f00d5df40aa0686ffbc581ef60878645613b1fc3303de5030',
	digest: {
		logs: [
			{
				PreRuntime: [
					1161969986,
					'0x036d000000f4f4d80f00000000ec9bd8e2d0368c97f3d888837f7283bbe08266869eb613159db547905026c2502a70f168b9ffcc233344005d11ebecd166769200d270a2eaa642118a00acb708a0487a440b0caf3dd5c91ab173e80ddfe5735ef8b938ea87a6105a1161612707',
				],
			},
			{
				Seal: [
					1161969986,
					'0xae78514e1de84a7d32e55b9b652f9d408ab1f7b4bfdbf6b2fad9cad94a91b86b0161cabf08f5ae1d3a1aa4993e2d96d56c94b03cee0898ccb8385a546084f88b',
				],
			},
		],
	},
	author: '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK',
};

const mockBlock789629 = {
	header: kusamaRegistry.createType('Header', header789629),
} as Block;

/**
 * Mock polkadot-js api.
 */
const api = ({
	createType: kusamaRegistry.createType.bind(kusamaRegistry),
	query: {
		transactionPayment: {
			nextFeeMultiplier: {
				at: (_parentHash: Hash) =>
					Promise.resolve().then(() =>
						kusamaRegistry.createType('Fixed128', 1000000000)
					),
			},
		},
	},
	consts: {
		transactionPayment: {
			transactionByteFee: kusamaRegistry.createType('Balance', 1000000),
			weightToFee: () =>
				Promise.resolve().then(() => [
					{
						coeffFrac: 80000000,
						coeffInteger: 0,
						degree: 1,
						negative: false,
					},
				]),
		},
		system: {
			extrinsicBaseWeight: kusamaRegistry.createType('u64', 125000000),
		},
	},
	rpc: {
		chain: {
			getHeader: () =>
				Promise.resolve().then(() => {
					return kusamaRegistry.createType('Header', header789629);
				}),
		},
		state: {
			getRuntimeVersion: () =>
				Promise.resolve().then(() => {
					return {
						specName: 'polkadot',
						specVersion: kusamaRegistry.createType('u32', 16),
					};
				}),
		},
	},
} as unknown) as ApiPromise;

const blocksService = new BlocksService(api);

describe('BlocksService', () => {
	describe('createCalcFee & calc_fee', () => {
		it('calculates for proxy.proxy in polkadot block 789629', async () => {
			//tx hash: 0x6d6c0e955650e689b14fb472daf14d2bdced258c748ded1d6cb0da3bfcc5854f
			const { calcFee } = await blocksService['createCalcFee'](
				api,
				('0xParentHash' as unknown) as Hash,
				mockBlock789629
			);

			expect(calcFee?.calc_fee(BigInt(399480000), 534)).toBe('544000000');
		});
	});

	describe('BlocksService.parseGenericCall', () => {
		it('does not handle an empty object', () =>
			expect(() =>
				BlocksService['parseGenericCall'](
					({} as unknown) as GenericCall
				)
			).toThrow());

		it('parses a simple balances.transfer', () => {
			expect(
				JSON.stringify(BlocksService['parseGenericCall'](transfer))
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
				method: 'utility.batch',
				callIndex: new Uint8Array([1, 0]),
				args: {
					calls: [],
				},
			};

			expect(
				JSON.stringify(BlocksService['parseGenericCall'](batch4))
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
															calls: [
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
							},
							transferOutput,
						],
					},
				})
			);
		});

		it('handles a batch sudo proxy transfer', () => {
			const proxy = createCall('proxy', 'proxy', {
				forceProxyType: 'Any',
				call: transfer,
			});

			const sudo = createCall('sudo', 'sudo', {
				call: proxy,
			});

			const batch = createCall('utility', 'batch', {
				calls: [sudo, sudo, sudo],
			});

			const sudoOutput = {
				method: 'sudo.sudo',
				callIndex: new Uint8Array([18, 0]),
				args: {
					call: {
						method: 'proxy.proxy',
						callIndex: new Uint8Array([28, 0]),
						args: {
							real:
								'5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
							force_proxy_type: 'Any',
							call: transferOutput,
						},
					},
				},
			};

			expect(
				JSON.stringify(BlocksService['parseGenericCall'](batch))
			).toEqual(
				JSON.stringify({
					method: 'utility.batch',
					callIndex: new Uint8Array([1, 0]),
					args: {
						calls: [sudoOutput, sudoOutput, sudoOutput],
					},
				})
			);
		});
	});
});
