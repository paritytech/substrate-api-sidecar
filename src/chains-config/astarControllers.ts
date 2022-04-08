import { ControllerConfig } from '../types/chains-config';
import { initLRUCache } from './cache/lruCache';

/**
 * Controllers for Astar collator
 */
export const astarControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsVestingInfo',
		'AccountsValidate',
		'Blocks',
		'BlocksExtrinsics',
		'BlocksTrace',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsAssets',
		'PalletsStorage',
		'Paras',
		'RuntimeCode',
		'RuntimeMetadata',
		'RuntimeSpec',
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
