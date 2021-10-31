import { polkadotAccountBalanceEndpoints } from './balance-info';
import { polkadotAccountValidateEndpoints } from './validate';
import { polkadotAccountVestingInfoEndpoints } from './vesting-info';
import { polkadotAccountStakingInfoEndpoints } from './staking-info';

export const polkadotAccountsEndpoints = [
	...polkadotAccountBalanceEndpoints,
	...polkadotAccountStakingInfoEndpoints,
	...polkadotAccountVestingInfoEndpoints,
	...polkadotAccountValidateEndpoints,
];
