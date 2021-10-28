import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight, perClass } from './substrateConsts';

export const kusamaDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			1062, 2005, 2007, 2008, 2011, 2012, 2013, 2015, 2019, 2022, 2023, 2024,
			2025, 2026,
		],
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [
			2027, 2028, 2029, 2030, 9000, 9010, 9030, 9040, 9050, 9070, 9080, 9090,
			9100, 9110, 9111, 9122,
		],
		perClass,
	},
];
