import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const acalaDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [2000, 2001, 2002],
		extrinsicBaseWeight,
	},
];
