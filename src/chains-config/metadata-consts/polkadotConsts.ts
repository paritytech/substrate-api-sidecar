import { MetadataConstDefinition } from '../../types/chains-config';
import { blockWeights, extrinsicBaseWeight } from './substrateConsts';

export const polkadotDefinitions: MetadataConstDefinition[] = [
	{
		runtimeVersions: [
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
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [27, 28],
		blockWeights,
	},
];
