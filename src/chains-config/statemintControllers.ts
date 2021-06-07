import { ControllerConfig } from '../types/chains-config';

/**
 * Statemint configuration for Sidecar.
 */
export const statemintControllers: ControllerConfig = {
	controllers: [
		'AccountsAssets',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsAssets',
		'RuntimeCode',
		'RuntimeMetadata',
		'RuntimeSpec',
		'TransactionDryRun',
		'TransactionFeeEstimate',
		'TransactionMaterial',
		'TransactionSubmit',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 0,
		blockWeightStore: {},
	},
};
