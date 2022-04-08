import { ControllerConfig } from '../types/chains-config';
import { initLRUCache } from './cache/lruCache';

/**
 * Controllers for crust collator
 */
export const crustControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsValidate',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
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
		minCalcFeeRuntime: 1,
		blockStore: initLRUCache(),
	},
};
