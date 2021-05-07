import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for KILT's mashnet.
 */
export const kiltControllers: ControllerConfig = {
	controllers: {
		Assets: false,
		Blocks: true,
		BlocksExtrinsics: true,
		AccountsAssets: false,
		AccountsStakingPayouts: false,
		AccountsBalanceInfo: true,
		AccountsStakingInfo: true,
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
		PalletsStakingProgress: false,
		PalletsStorage: true,
		Paras: false,
	},
	options: {
		finalizes: true,
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
