import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight, perClass } from './substrateConsts';

export const dockMainnetDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
		],
		extrinsicBaseWeight,
	},
];

export const dockPoSMainnetDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [29],
		perClass,
	},
];

export const dockPoSTestnetDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [26, 27, 28, 29],
		perClass,
	},
];
