import { Definition } from '../../types/chains-config';
import { kusamaDefinitions } from './kusama-consts';
import { polkadotDefinitions } from './polkadot-consts';

/**
 * Creates an object that orders each runtime to their appropriate data
 *
 * @param definitions An array of objects that group data based on runtimes
 * and their extrinsicBaseWeight metadata
 */
const generateBlockWeightObject = (
	definitions: Definition[]
): Record<string, Definition> => {
	const blockWeightObject = {};

	for (let i = 0; i < definitions.length; i++) {
		const runtimes: number[] = definitions[i].runtimes;

		for (let p = 0; p < runtimes.length; p++) {
			const version: number = runtimes[p];
			blockWeightObject[version] = definitions[i];
		}
	}

	return blockWeightObject;
};

/**
 * Returns a set of runtime pointing to their blockWeightDefinitions specific to
 * a chain
 *
 * @param specName specName from the metadata of the current block being fetched
 */
export const getBlockWeight = (
	specName: string
): Record<string, Definition> => {
	switch (specName) {
		case 'polkadot':
			return Object.freeze(generateBlockWeightObject(polkadotDefinitions));
		case 'kusama':
			return Object.freeze(generateBlockWeightObject(kusamaDefinitions));
		default:
			return {};
	}
};
