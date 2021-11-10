import { statemineAccountAssetEndpoints } from './accounts';
import { statemineBlockEndpoints } from './blocks';
import { statemineRuntimeEndpoints } from './runtime';

export const statemineEndpoints = {
	accounts: statemineAccountAssetEndpoints,
	blocks: statemineBlockEndpoints,
	paras: [],
	runtime: statemineRuntimeEndpoints,
};
