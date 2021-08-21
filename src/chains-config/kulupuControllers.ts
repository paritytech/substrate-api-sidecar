import { ControllerConfig } from '../types/chains-config';
import { initLRUCache } from './cache/lruCache';

export const kulupuControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'Blocks',
		'BlocksExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsAssets',
		'RuntimeCode',
		'RuntimeMetadata',
		'RuntimeSpec',
		'TransactionDryRun',
		'TransactionFeeEstimate',
		'TransactionMaterial',
		'TransactionSubmit',
	],
	options: {
		finalizes: false,
		minCalcFeeRuntime: null,
		blockWeightStore: {},
		blockStore: initLRUCache(),
	},
};
