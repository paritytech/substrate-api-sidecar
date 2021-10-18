import { polkadotAccountBalanceEndpoints } from './balance-info';
import { polkadotAccountVestingInfoEndpoints } from './vesting-info';

export const polkadotAccountsEndpoints = [
	...polkadotAccountBalanceEndpoints,
	...polkadotAccountVestingInfoEndpoints,
];
