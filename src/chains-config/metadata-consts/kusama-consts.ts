import { Definition } from '../../types/chains-config';

/**
 * All Runtimes before v2027
 */
const extrinsicBaseWeight = 125000000;

/**
 * Runtimes after v2026
 */
const blockWeights = {
	baseBlock: 5000000000,
	maxBlock: 2000000000000,
	perClass: {
		normal: {
			baseExtrinsic: 125000000,
			maxExtrinsic: 371168000000001,
			maxTotal: null,
			reserved: 1500000000000,
		},
		operational: {
			baseExtrinsic: 1,
			maxExtrinsic: 32000000000,
			maxTotal: null,
			reserved: 1949875000000,
		},
		mandatory: {
			baseExtrinsic: 512000000000001,
			maxExtrinsic: '0x00746a5288000100',
			maxTotal: null,
			reserved: null,
		},
	},
};

export const kusamaDefinitions: Definition[] = [
	{
		runtimes: [
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
		chain: 'kusama',
		extrinsicBaseWeight,
	},
	{
		runtimes: [2027, 2028, 2029],
		chain: 'kusama',
		blockWeights,
	},
];
