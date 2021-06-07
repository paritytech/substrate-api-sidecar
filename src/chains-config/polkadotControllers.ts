import { ControllerConfig } from '../types/chains-config';
import { getBlockWeight } from './metadata-consts';

/**
 * Polkadot configuration for Sidecar.
 */
export const polkadotControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsStakingInfo',
		'AccountsStakingPayouts',
		'AccountsVestingInfo',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsStakingProgress',
		'PalletsStorage',
		'Paras',
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
		blockWeightStore: getBlockWeight('polkadot'),
	},
};
