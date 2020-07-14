import AccountId from '@polkadot/types/generic/AccountId';
import { RewardDestination, StakingLedger } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountStakingInfo {
	at: IAt;
	controller: AccountId;
	rewardDestination: RewardDestination;
	numSlashingSpans: number;
	staking: StakingLedger;
}
