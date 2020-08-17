import { Balance } from '@polkadot/types/interfaces';
import { Big } from 'big.js';

export interface IPayout {
	validatorId: string;
	nominatorPayoutEstimate: Big;
	validatorTotalPayoutEstimate: Big;
	claimed: boolean;
	validatorCommission: Big;
	validatorRewardPoints: string;
	totalValidatorExposure: Balance;
	nominatorExposure: Balance;
}
