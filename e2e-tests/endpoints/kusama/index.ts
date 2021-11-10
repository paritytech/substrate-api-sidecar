import { kusamaAccountsEndpoints } from './accounts';
import { kusamaBlockEndpoints } from './blocks';
import { kusamaParasEndpoints } from './paras';
import { kusamaRuntimeEndpoints } from './runtime';

export const kusamaEndpoints = {
	blocks: kusamaBlockEndpoints,
	accounts: kusamaAccountsEndpoints,
	paras: kusamaParasEndpoints,
	runtime: kusamaRuntimeEndpoints,
};
