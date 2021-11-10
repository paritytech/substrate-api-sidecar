import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const karuraDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011,
			1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 2000, 2001,
		],
		extrinsicBaseWeight,
	},
];
