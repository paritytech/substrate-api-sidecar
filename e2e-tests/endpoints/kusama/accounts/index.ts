import { kusamaAccountBalanceEndpoints } from './balance-info';
import { kusamaAccountStakingInfoEndpoints } from './staking-info';
import { kusamaAccountValidateEndpoints } from './validate';
import { kusamaAccountVestingInfoEndpoints } from './vesting-info';

export const kusamaAccountsEndpoints = [
	...kusamaAccountBalanceEndpoints,
	...kusamaAccountStakingInfoEndpoints,
	...kusamaAccountVestingInfoEndpoints,
	...kusamaAccountValidateEndpoints,
];
