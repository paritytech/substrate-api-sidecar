import { ApiPromise } from '@polkadot/api';
import { Block, Hash } from '@polkadot/types/interfaces';

import { kusamaRegistry } from '../../utils/testTools';
import { header789629 } from './header78629';

/**
 * Mock polkadot-js api.
 */
export const mockApi = ({
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
			weightToFee: [
				{
					coeffFrac: 80000000,
					coeffInteger: 0,
					degree: 1,
					negative: false,
				},
			],
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

/**
 * Mock for polkadot block #789629
 */
export const mockBlock789629 = {
	header: kusamaRegistry.createType('Header', header789629),
} as Block;
