import { RewardDestination, StakingLedger } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { IAt } from '.';

export interface IAccountStakingInfo {
	at: IAt;
	controller: AccountId;
	rewardDestination: RewardDestination;
	numSlashingSpans: number;
	staking: StakingLedger;
}
