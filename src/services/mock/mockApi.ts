import { ApiPromise } from '@polkadot/api';
import { Block, Hash } from '@polkadot/types/interfaces';

// import { Block, Hash } from '@polkadot/types/interfaces';
import {
	decoratedPolkadotMetadata,
	polkadotRegistry,
} from '../../test-helpers/testTools';
import * as block789629 from './data/block789629.json';
import { events789629 } from './data/events789629Hex';

/**
 * Mock for polkadot block #789629
 */
export const mockBlock789629 = polkadotRegistry.createType(
	'Block',
	block789629
);

const eventsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<EventRecord>', events789629)
	);

const chain = () =>
	Promise.resolve().then(() => {
		return polkadotRegistry.createType('Text', ' Polkadot');
	});

export const getBlock = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return { block: mockBlock789629 };
	});

const getHeader = (_hash: Hash) =>
	Promise.resolve().then(() => mockBlock789629.header);

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return {
			specName: polkadotRegistry.createType('Text', 'polkadot'),
			specVersion: polkadotRegistry.createType('u32', 16),
			transactionVersion: polkadotRegistry.createType('u32', 2),
		};
	});

const getMetadata = () =>
	Promise.resolve().then(() => decoratedPolkadotMetadata.metadata);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType(
				'AccountId',
				'1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'
			),
		};
	});

const nextFeeMultiplierAt = (_parentHash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Fixed128', 1000000000)
	);

/**
 * Mock polkadot-js ApiPromise.
 */
export const mockApi = ({
	createType: polkadotRegistry.createType.bind(polkadotRegistry),
	registry: polkadotRegistry,
	query: {
		system: {
			events: {
				at: eventsAt,
			},
		},
		transactionPayment: {
			nextFeeMultiplier: {
				at: nextFeeMultiplierAt,
			},
		},
	},
	consts: {
		transactionPayment: {
			transactionByteFee: polkadotRegistry.createType('Balance', 1000000),
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
			extrinsicBaseWeight: polkadotRegistry.createType('u64', 125000000),
		},
	},
	rpc: {
		chain: {
			getHeader,
			getBlock,
		},
		state: {
			getRuntimeVersion,
			getMetadata,
		},
		system: {
			chain,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
		},
	},
} as unknown) as ApiPromise;
