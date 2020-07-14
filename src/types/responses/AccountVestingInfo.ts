import { Option } from '@polkadot/types/codec';
import { VestingInfo } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountVestingInfo {
	at: IAt;
	// eslint-disable-next-line @typescript-eslint/ban-types
	vesting: Option<VestingInfo> | {};
}
