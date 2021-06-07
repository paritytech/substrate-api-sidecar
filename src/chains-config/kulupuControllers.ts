import { ControllerConfig } from '../types/chains-config';

export const kulupuControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
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
		finalizes: false,
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
