import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight } from './substrateConsts';

export const bifrostDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			1, 801, 802, 803, 804, 805, 900, 901, 902, 903, 904, 906, 907, 908, 909,
			910, 912, 913, 914, 915, 916, 918, 920, 922, 923, 924, 925, 926, 927,
		],
		extrinsicBaseWeight,
	},
];
