import { westendAccountBalanceEndpoints } from './balance-info';
import { westendAccountStakingInfoEndpoints } from './staking-info';
import { westendAccountValidateEndpoints } from './validate';
import { westendAccountVestingInfoEndpoints } from './vesting-info';

export const westendAccountsEndpoints = [
	...westendAccountBalanceEndpoints,
	...westendAccountStakingInfoEndpoints,
	...westendAccountVestingInfoEndpoints,
	...westendAccountValidateEndpoints,
];
