import { ControllerConfig } from '../types/chains-config';
import { getBlockWeight } from './metadata-consts';

/**
 * Kusama configuration for Sidecar.
 */
export const kusamaControllers: ControllerConfig = {
	controllers: {
		Blocks: true,
		BlocksExtrinsics: true,
		BlocksTrace: true,
		AccountsAssets: true,
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
		PalletsAssets: true,
		PalletsStakingProgress: true,
		PalletsStorage: true,
		Paras: true,
	},
	options: {
		finalizes: true,
		minCalcFeeRuntime: 1062,
		blockWeightStore: getBlockWeight('kusama'),
	},
};
