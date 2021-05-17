import { ControllerConfig } from '../types/chains-config';

/**
 * Controllers that Sidecar will always default to. This will always be
 * the optimal controller selection for Polkadot and Kusama.
 */
export const defaultControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
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
		minCalcFeeRuntime: null,
		blockWeightStore: {},
	},
};
