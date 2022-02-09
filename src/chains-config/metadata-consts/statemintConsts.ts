import { MetadataConsts } from '../../types/chains-config';
import { perClassCommonParachains } from './commonParachainsConsts';

export const statemintDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [2, 601],
		perClass: perClassCommonParachains,
	},
];
