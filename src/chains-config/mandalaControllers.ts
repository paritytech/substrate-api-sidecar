import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers for mandala, acala's test network.
 */
export const mandalaControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
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
		'PalletsStakingProgress',
		'PalletsStorage',
		'Paras',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
