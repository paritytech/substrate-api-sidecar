import { ControllerConfig } from '../types/chains-config';
import { getBlockWeight } from './metadata-consts';

/**
 * Kusama configuration for Sidecar.
 */
export const kusamaControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
		'BlocksTrace',
		'AccountsAssets',
		'AccountsStakingPayouts',
		'AccountsBalanceInfo',
		'AccountsStakingInfo',
		'AccountsVestingInfo',
		'NodeNetwork',
		'NodeVersion',
		'NodeTransactionPool',
		'RuntimeCode',
		'RuntimeSpec',
		'RuntimeMetadata',
		'TransactionDryRun',
		'TransactionMaterial',
		'TransactionFeeEstimate',
		'TransactionSubmit',
		'PalletsAssets',
		'PalletsStakingProgress',
		'PalletsStorage',
		'Paras',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 1062,
		blockWeightStore: getBlockWeight('kusama'),
	},
};
