import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const mantaDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [3090],
		extrinsicBaseWeight,
	},
];
