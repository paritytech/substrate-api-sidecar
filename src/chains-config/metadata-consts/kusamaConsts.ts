import { MetadataConstDefinition } from '../../types/chains-config';
import { blockWeights, extrinsicBaseWeight } from './substrateConsts';

export const kusamaDefinitions: MetadataConstDefinition[] = [
	{
		runtimeVersions: [
			1062,
			2005,
			2007,
			2008,
			2011,
			2012,
			2013,
			2015,
			2019,
			2022,
			2023,
			2024,
			2025,
			2026,
		],
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [2027, 2028, 2029],
		blockWeights,
	},
];
