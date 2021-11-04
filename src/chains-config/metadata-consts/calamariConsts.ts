import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const calamariDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [1, 2, 3, 4],
		extrinsicBaseWeight,
	},
];
