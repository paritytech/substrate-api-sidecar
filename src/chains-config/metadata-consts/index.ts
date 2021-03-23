import { MetadataConstDefinition } from '../../types/chains-config';
import { kusamaDefinitions } from './kusamaConsts';
import { polkadotDefinitions } from './polkadotConsts';

/**
 * Creates an object that orders each runtime to their appropriate data
 *
 * @param definitions An array of objects that group data based on runtimes
 * and their extrinsicBaseWeight metadata
 */
const generateBlockWeightObject = (
	definitions: MetadataConstDefinition[]
): Record<string, MetadataConstDefinition> => {
	const blockWeightObject = {};

	for (const def of definitions) {
		const runtimeVersions: number[] = def.runtimeVersions;
		for (const version of runtimeVersions) {
			blockWeightObject[version] = def;
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
): Record<string, MetadataConstDefinition> => {
	switch (specName) {
		case 'polkadot':
			return generateBlockWeightObject(polkadotDefinitions);
		case 'kusama':
			return generateBlockWeightObject(kusamaDefinitions);
		default:
			return {};
	}
};
