import { Definition } from '../../types/chains-config';

/**
 * All Runtimes before v27
 */
const extrinsicBaseWeight = 125000000;

/**
 * Runtimes after v26
 */
const blockWeights = {
	baseBlock: 5000000000,
	maxBlock: 2000000000000,
	perClass: {
		normal: {
			baseExtrinsic: 125000000,
			maxExtrinsic: 371168000000001,
			maxTotal: null,
			reserved: 1500000000000,
		},
		operational: {
			baseExtrinsic: 1,
			maxExtrinsic: 32000000000,
			maxTotal: null,
			reserved: 1949875000000,
		},
		mandatory: {
			baseExtrinsic: 512000000000001,
			maxExtrinsic: '0x00746a5288000100',
			maxTotal: null,
			reserved: null,
		},
	},
};

export const polkadotDefinitions: Definition[] = [
	{
		runtimes: [
			0,
			1,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			23,
			24,
			25,
			26,
		],
		chain: 'polkadot',
		extrinsicBaseWeight,
	},
	{
		runtimes: [27, 28],
		chain: 'polkadot',
		blockWeights,
	},
];
