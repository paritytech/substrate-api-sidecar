import { westendAccountsEndpoints } from './accounts';
import { westendBlockEndpoints } from './blocks';
import { westendRuntimeEndpoints } from './runtime';

export const westendEndpoints = {
	blocks: westendBlockEndpoints,
	accounts: westendAccountsEndpoints,
	runtime: westendRuntimeEndpoints,
};
