import { polkadotAccountBalanceEndpoints } from './balance-info';
import { polkadotAccountStakingInfoEndpoints } from './staking-info';
import { polkadotAccountValidateEndpoints } from './validate';
import { polkadotAccountVestingInfoEndpoints } from './vesting-info';

export const polkadotAccountsEndpoints = [
	...polkadotAccountBalanceEndpoints,
	...polkadotAccountStakingInfoEndpoints,
	...polkadotAccountVestingInfoEndpoints,
	...polkadotAccountValidateEndpoints,
];
