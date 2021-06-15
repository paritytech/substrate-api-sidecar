import { ControllerConfig } from '../types/chains-config';
import { getBlockWeight } from './metadata-consts';

/**
 * Polymesh configuration for Sidecar.
 */
export const polymeshControllers: ControllerConfig = {
	controllers: [
		'AccountsStakingPayouts',
		'AccountsStakingInfo',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsStakingProgress',
		'PalletsStorage',
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
		blockWeightStore: getBlockWeight('polymesh'),
	},
};
