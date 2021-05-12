import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for Dock's test network.
 */
export const dockTestnetControllers: ControllerConfig = {
	controllers: {
		Blocks: true,
		BlocksExtrinsics: true,
		BlocksTrace: false,
		AccountsAssets: false,
		AccountsStakingPayouts: false,
		AccountsBalanceInfo: true,
		AccountsStakingInfo: false,
		AccountsVestingInfo: false,
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
		PalletsAssets: false,
		PalletsStakingProgress: false,
		PalletsStorage: true,
		Paras: false,
	},
	options: {
		finalizes: true,
		minCalcFeeRuntime: 1,
		blockWeightStore: {},
	},
};
