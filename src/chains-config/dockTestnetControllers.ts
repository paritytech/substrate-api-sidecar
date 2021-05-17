import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for Dock's test network.
 */
export const dockTestnetControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
		'AccountsBalanceInfo',
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
		'PalletsStorage',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 1,
		blockWeightStore: {},
	},
};
