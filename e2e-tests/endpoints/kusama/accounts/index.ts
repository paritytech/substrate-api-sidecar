import { kusamaAccountBalanceEndpoints } from './balance-info';
import { kusamaAccountValidateEndpoints } from './validate';
import { kusamaAccountVestingInfoEndpoints } from './vesting-info';

export const kusamaAccountsEndpoints = [
	...kusamaAccountBalanceEndpoints,
	...kusamaAccountVestingInfoEndpoints,
	...kusamaAccountValidateEndpoints,
];
