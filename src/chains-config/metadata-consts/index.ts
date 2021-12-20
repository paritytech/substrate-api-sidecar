import {
	BlockWeightStore,
	ExtBaseWeightValue,
	isExtBaseWeightValue,
	isPerClassValue,
	MetadataConsts,
	PerClassValue,
} from '../../types/chains-config';
import { acalaDefinitions } from './acalaConsts';
import { calamariDefinitions } from './calamariConsts';
import {
	dockMainnetDefinitions,
	dockPoSMainnetDefinitions,
	dockPoSTestnetDefinitions,
} from './dockConsts';
import { karuraDefinitions } from './karuraConsts';
import { kusamaDefinitions } from './kusamaConsts';
import { mantaDefinitions } from './mantaConsts';
import { polkadotDefinitions } from './polkadotConsts';
import { polymeshDefinitions } from './polymeshConsts';
import { shidenDefinitions } from './shidenConsts';
import { statemineDefinitions } from './statemineConsts';
import { statemintDefinitions } from './statemintConsts';
import { westendDefinitions } from './westendConsts';

/**
 * Creates an object that maps each runtime to their appropriate weight data.
 *
 * Each runtime imports their own `chainDefinitions`. `chainDefinitions`
 * are arrays that store objects which group a set of runtimes version and associated
 * extrinsic weight data.
 *
 * Example return object:
 * {
 * 	   ...
 *     24: { extrinsicBaseWeight: 125000000 },
 *     25: { extrinsicBaseWeight: 125000000 },
 *     26: { extrinsicBaseWeight: 125000000 },
 *     27: { blockWeights: { perClass: [Object] } },
 *     28: { blockWeights: { perClass: [Object] } }
 *     ...
 * }
 *
 * @param chainDefinitions An array of objects that group data based on runtimes
 * and their extrinsicBaseWeight metadata
 */
export function generateBlockWeightStore(
	chainDefinitions: MetadataConsts[]
): BlockWeightStore {
	const blockWeightStore: BlockWeightStore = {};

	for (const def of chainDefinitions) {
		const runtimeVersions = def.runtimeVersions;
		for (const version of runtimeVersions) {
			blockWeightStore[version] = {};

			if (isExtBaseWeightValue(def)) {
				(blockWeightStore[version] as ExtBaseWeightValue).extrinsicBaseWeight =
					def.extrinsicBaseWeight;
			} else if (isPerClassValue(def)) {
				(blockWeightStore[version] as PerClassValue).perClass = def.perClass;
			} else {
				throw new Error(
					'No Valid weight type found while generating block weight store'
				);
			}
		}
	}

	return blockWeightStore;
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
		case 'polymesh':
			return generateBlockWeightStore(polymeshDefinitions);
		case 'kusama':
			return generateBlockWeightStore(kusamaDefinitions);
		case 'westend':
			return generateBlockWeightStore(westendDefinitions);
		case 'statemint':
			return generateBlockWeightStore(statemintDefinitions);
		case 'statemine':
			return generateBlockWeightStore(statemineDefinitions);
		case 'dock-main-runtime':
			return generateBlockWeightStore(dockMainnetDefinitions);
		case 'dock-pos-main-runtime':
			return generateBlockWeightStore(dockPoSMainnetDefinitions);
		case 'dock-pos-test-runtime':
			return generateBlockWeightStore(dockPoSTestnetDefinitions);
		case 'shiden':
			return generateBlockWeightStore(shidenDefinitions);
		case 'calamari':
			return generateBlockWeightStore(calamariDefinitions);
		case 'karura':
			return generateBlockWeightStore(karuraDefinitions);
		case 'acala':
			return generateBlockWeightStore(acalaDefinitions);
		case 'manta':
			return generateBlockWeightStore(mantaDefinitions);
		default:
			return {};
	}
}
