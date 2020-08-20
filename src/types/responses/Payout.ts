import { Balance, Perbill, RewardPoint } from '@polkadot/types/interfaces';

export interface IPayout {
	validatorId: string;
	ownStakingPayout: string;
	claimed: boolean;
	validatorTotalPayout: string;
	validatorCommission: Perbill;
	validatorRewardPoints: RewardPoint;
	totalValidatorExposure: Balance;
	ownExposure: Balance;
}
