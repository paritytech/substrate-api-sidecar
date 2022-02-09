import { MetadataConsts } from '../../types/chains-config';
import { perClassCommonParachains } from './commonParachainsConsts';
import { perClass } from './substrateConsts';

/**
 * Statemine before runtime version 601 uses the same weight fees as
 * substrateConsts `perClass`, therefore both objects within the statemine
 * definitions will have the `perClass` key, but their values will differ.
 */
export const statemineDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [601],
		perClass: perClassCommonParachains,
	},
	{
		runtimeVersions: [1, 2, 3, 4, 5],
		perClass,
	},
];
