import { ControllerConfig } from '../types/chains-config';
import { initLRUCache } from './cache/lruCache';
import { getBlockWeight } from './metadata-consts';

/**
 * Controllers for Shiden collator
 */
export const shidenControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsVestingInfo',
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
		blockWeightStore: getBlockWeight('shiden'),
		blockStore: initLRUCache(),
	},
};
