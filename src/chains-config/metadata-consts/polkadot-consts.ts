import { Definition } from '../../types/chains-config';
import { blockWeights, extrinsicBaseWeight } from './substrate-consts';

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
