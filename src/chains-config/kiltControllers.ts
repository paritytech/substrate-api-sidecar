import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for KILT's mashnet.
 */
export const kiltControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsStakingInfo',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsStorage',
		'RuntimeCode',
		'RuntimeSpec',
		'RuntimeMetadata',
		'TransactionDryRun',
		'TransactionMaterial',
		'TransactionFeeEstimate',
		'TransactionSubmit',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
