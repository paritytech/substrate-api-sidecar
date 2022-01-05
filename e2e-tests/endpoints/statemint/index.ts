import { statemintBlockEndpoints } from './blocks';
import { statemineRuntimeEndpoints } from './runtime';

export const statemintEndpoints = {
	accounts: [],
	blocks: statemintBlockEndpoints,
	paras: [],
	runtime: statemineRuntimeEndpoints,
};
