import {
	MetadataConstDefinition,
	MetadataWeightDefinition,
} from '../../types/chains-config';
import { kusamaDefinitions } from './kusamaConsts';
import { polkadotDefinitions } from './polkadotConsts';

/**
 * Creates an object that orders each runtime to their appropriate weight data.
 *
 * Each runtime imports their own data which is called Definitions here. Definitions
 * are arrays that store objects which group a set of runtimes version connected
 * to their classification of extrinsic weight data.
 *
 * Example return object:
 * {
 * 	   ...
 *     '24': { extrinsicBaseWeight: 125000000 },
 *     '25': { extrinsicBaseWeight: 125000000 },
 *     '26': { extrinsicBaseWeight: 125000000 },
 *     '27': { blockWeights: { perClass: [Object] } },
 *     '28': { blockWeights: { perClass: [Object] } }
 *     ...
 * }
 * @param definitions An array of objects that group data based on runtimes
 * and their extrinsicBaseWeight metadata
 */
const generateBlockWeightObject = (
	chainDefinitions: MetadataConstDefinition[]
): Record<string, MetadataWeightDefinition> => {
	const blockWeightObject: Record<string, MetadataWeightDefinition> = {};

	for (const def of chainDefinitions) {
		const runtimeVersions: number[] = def.runtimeVersions;
		for (const version of runtimeVersions) {
			const weightType: string = def.extrinsicBaseWeight
				? 'extrinsicBaseWeight'
				: 'blockWeights';

			blockWeightObject[version] = {} as MetadataConstDefinition;
			blockWeightObject[version][weightType] =
				def.blockWeights || def.extrinsicBaseWeight;
		}
	}

	return blockWeightObject;
};

/**
 * Returns a set of runtimes pointing to their blockWeightDefinitions specific to
 * a chain
 *
 * @param specName specName from the metadata of the current block being fetched
 */
export const getBlockWeight = (
	specName: string
): Record<string, MetadataWeightDefinition> => {
	switch (specName) {
		case 'polkadot':
			return generateBlockWeightObject(polkadotDefinitions);
		case 'kusama':
			return generateBlockWeightObject(kusamaDefinitions);
		default:
			return {};
	}
};
