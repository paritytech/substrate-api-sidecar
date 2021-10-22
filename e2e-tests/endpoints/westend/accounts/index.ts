import { westendAccountBalanceEndpoints } from './balance-info';
import { westendAccountValidateEndpoints } from './validate';
import { westendAccountVestingInfoEndpoints } from './vesting-info';

export const westendAccountsEndpoints = [
	...westendAccountBalanceEndpoints,
	...westendAccountVestingInfoEndpoints,
	...westendAccountValidateEndpoints,
];
