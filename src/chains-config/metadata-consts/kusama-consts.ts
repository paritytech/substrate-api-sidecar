import { Definition } from '../../types/chains-config';
import { blockWeights, extrinsicBaseWeight } from './substrate-consts';

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
