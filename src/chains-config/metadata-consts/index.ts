import {
	BlockWeightStore,
	ExtBaseWeightValue,
	MetadataConsts,
	PerClassValue,
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
export function generateBlockWeightStore(
	chainDefinitions: MetadataConsts[]
): BlockWeightStore {
	const blockWeightObject: BlockWeightStore = {};

	for (const def of chainDefinitions) {
		const runtimeVersions = def.runtimeVersions;
		for (const version of runtimeVersions) {
			blockWeightObject[version] = {};

			if (def.extrinsicBaseWeight) {
				(blockWeightObject[version] as ExtBaseWeightValue).extrinsicBaseWeight =
					def.extrinsicBaseWeight;
			} else if (def.perClass) {
				(blockWeightObject[version] as PerClassValue).perClass = def.perClass;
			} else {
				throw new Error(
					'No Valid weight type found while generating block weight store'
				);
			}
		}
	}

	return blockWeightObject;
}

/**
 * Returns a set of runtimes pointing to their blockWeightDefinitions specific to
 * a chain
 *
 * @param specName specName from the metadata of the current block being fetched
 */
export function getBlockWeight(specName: string): BlockWeightStore {
	switch (specName) {
		case 'polkadot':
			return generateBlockWeightStore(polkadotDefinitions);
		case 'kusama':
			return generateBlockWeightStore(kusamaDefinitions);
		default:
			return {};
	}
}
