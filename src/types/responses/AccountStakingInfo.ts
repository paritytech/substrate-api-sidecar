import { GenericAccountId } from '@polkadot/types';
import { RewardDestination, StakingLedger } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountStakingInfo {
	at: IAt;
	controller: GenericAccountId;
	rewardDestination: RewardDestination;
	numSlashingSpans: number;
	staking: StakingLedger;
}
