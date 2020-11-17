import { Compact } from '@polkadot/types';
import { AccountId, Balance, EraIndex } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface INominations {
	at?: IAt;
	submittedIn: EraIndex | null;
	targets: ITarget[];
}

export interface ITarget {
	address: String | AccountId;
	value: Compact<Balance> | null;
	status: 'active' | 'inactive' | 'waiting' | null;
}
