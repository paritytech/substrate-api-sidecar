import { ControllerConfig } from '../types/chains-config';
import { getBlockWeight } from './metadata-consts';

/**
 * Polkadot configuration for Sidecar.
 */
export const polkadotControllers: ControllerConfig = {
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
		minCalcFeeRuntime: 0,
		blockWeightStore: getBlockWeight('polkadot'),
	},
};
