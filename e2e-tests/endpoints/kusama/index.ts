import { kusamaAccountsEndpoints } from './accounts';
import { kusamaBlockEndpoints } from './blocks';
import { kusamaRuntimeEndpoints } from './runtime';

export const kusamaEndpoints = {
	blocks: kusamaBlockEndpoints,
	accounts: kusamaAccountsEndpoints,
	runtime: kusamaRuntimeEndpoints,
};
