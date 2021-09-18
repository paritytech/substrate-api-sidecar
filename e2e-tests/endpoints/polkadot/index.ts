import { polkadotAccountsEndpoints } from './accounts';
import { polkadotBlockEndpoints } from './blocks';
import { polkadotRuntimeEndpoints } from './runtime';

export const polkadotEndpoints = {
	blocks: polkadotBlockEndpoints,
	accounts: polkadotAccountsEndpoints,
	runtime: polkadotRuntimeEndpoints,
};
