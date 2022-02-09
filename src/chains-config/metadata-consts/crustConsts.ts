import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const crustDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
		extrinsicBaseWeight,
	},
];
