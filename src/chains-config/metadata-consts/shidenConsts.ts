import { MetadataConsts } from '../../types/chains-config';

export const shidenDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [1, 2, 3, 6, 7, 8, 10, 14, 15],
		perClass: {
			normal: {
				baseExtrinsic: BigInt(125000000),
			},
			operational: {
				baseExtrinsic: BigInt(1),
			},
			mandatory: {
				baseExtrinsic: BigInt(128000000000001),
			},
		},
	},
];
