import { kusamaAccountBalanceEndpoints } from './balance-info';
import { kusamaAccountVestingInfoEndpoints } from './vesting-info';

export const kusamaAccountsEndpoints = [
	...kusamaAccountBalanceEndpoints,
	...kusamaAccountVestingInfoEndpoints,
];
