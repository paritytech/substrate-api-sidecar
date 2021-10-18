import { westendAccountBalanceEndpoints } from './balance-info';
import { westendAccountVestingInfoEndpoints } from './vesting-info';

export const westendAccountsEndpoints = [
	...westendAccountBalanceEndpoints,
	...westendAccountVestingInfoEndpoints,
];
