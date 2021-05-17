import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for KILT's mashnet.
 */
export const kiltControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
		'AccountsBalanceInfo',
		'AccountsStakingInfo',
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
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
