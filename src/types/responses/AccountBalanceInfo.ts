import { Vec } from '@polkadot/types';
import {
	Balance,
	BalanceLock,
	Index,
	LockIdentifier,
	Reasons,
} from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountBalanceInfo {
	at: IAt;
	tokenSymbol: string;
	nonce: Index;
	free: Balance | string;
	reserved: Balance | string;
	miscFrozen: Balance | string;
	feeFrozen: Balance | string;
	locks: Vec<BalanceLock> | IBalanceLock[];
}

export interface IBalanceLock {
	id: LockIdentifier;
	amount: string;
	reasons: Reasons;
}
