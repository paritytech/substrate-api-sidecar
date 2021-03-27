import { ControllerConfig } from '../types/chains-config';

/**
 * Polkadot configuration for Sidecar.
 */
export const polkadotControllers: ControllerConfig = {
	controllers: {
		Blocks: true,
		BlocksExtrinsics: true,
		AccountsStakingPayouts: true,
		AccountsBalanceInfo: true,
		AccountsStakingInfo: true,
		AccountsVestingInfo: true,
		NodeNetwork: true,
		NodeVersion: true,
		NodeTransactionPool: true,
		RuntimeCode: true,
		RuntimeSpec: true,
		RuntimeMetadata: true,
		TransactionDryRun: true,
		TransactionMaterial: true,
		TransactionFeeEstimate: true,
		TransactionSubmit: true,
		PalletsStakingProgress: true,
		PalletsStorage: true,
	},
	options: {
		finalizes: true,
		minCalcFeeRuntime: 0,
	},
};
