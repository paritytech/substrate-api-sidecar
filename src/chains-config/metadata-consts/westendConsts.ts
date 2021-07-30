import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight, perClass } from './substrateConsts';

export const westendDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			6, 7, 8, 20, 28, 29, 30, 31, 32, 33, 24, 35, 41, 43, 44, 45,
		],
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [47, 48, 49, 50, 9010, 9030, 9033, 9050, 9070],
		perClass,
	},
];
