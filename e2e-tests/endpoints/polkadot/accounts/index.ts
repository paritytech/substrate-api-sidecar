import { polkadotAccountBalanceEndpoints } from './balance-info';
import { polkadotAccountValidateEndpoints } from './validate';
import { polkadotAccountVestingInfoEndpoints } from './vesting-info';

export const polkadotAccountsEndpoints = [
	...polkadotAccountBalanceEndpoints,
	...polkadotAccountVestingInfoEndpoints,
	...polkadotAccountValidateEndpoints,
];
