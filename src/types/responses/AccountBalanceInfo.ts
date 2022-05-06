import { Vec } from '@polkadot/types';
import { Balance, BalanceLock, Index } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountBalanceInfo {
	at: IAt;
	tokenSymbol: string;
	nonce: Index;
	free: Balance | string;
	reserved: Balance;
	miscFrozen: Balance;
	feeFrozen: Balance;
	locks: Vec<BalanceLock>;
}
