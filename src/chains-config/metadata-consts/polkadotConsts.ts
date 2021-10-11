import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight, perClass } from './substrateConsts';

export const polkadotDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 23, 24, 25, 26,
		],
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [
			27, 28, 29, 30, 9000, 9010, 9030, 9033, 9050, 9070, 9080, 9090, 9100,
			9110,
		],
		perClass,
	},
];
