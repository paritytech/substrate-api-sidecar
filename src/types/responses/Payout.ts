import { Balance, Perbill, RewardPoint } from '@polkadot/types/interfaces';

export interface IPayout {
	validatorId: string;
	nominatorStakingPayout: string;
	claimed: boolean;
	validatorCommission: Perbill;
	totalValidatorRewardPoints: RewardPoint;
	totalValidatorExposure: Balance;
	nominatorExposure: Balance;
}
