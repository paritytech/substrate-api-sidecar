import { EraIndex, RewardPoint } from '@polkadot/types/interfaces';

import { IPayout } from '.';

export interface IEraPayouts {
	era: EraIndex;
	totalEraRewardPoints: RewardPoint;
	payouts: IPayout[];
}
