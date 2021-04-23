import {
	AccountsBalanceInfo,
	AccountsStakingInfo,
	AccountsStakingPayouts,
	AccountsVestingInfo,
} from './accounts';
import { Blocks, BlocksExtrinsics, BlocksTrace } from './blocks';
import { NodeNetwork, NodeTransactionPool, NodeVersion } from './node';
import { PalletsStakingProgress, PalletsStorage } from './pallets';
import { Paras } from './paras';
import { RuntimeCode, RuntimeMetadata, RuntimeSpec } from './runtime';
import {
	TransactionDryRun,
	TransactionFeeEstimate,
	TransactionMaterial,
	TransactionSubmit,
} from './transaction';

/**
 * Object containing every controller class definition.
 */
export const controllers = {
	Blocks,
	BlocksExtrinsics,
	BlocksTrace,
	AccountsBalanceInfo,
	AccountsStakingInfo,
	AccountsVestingInfo,
	AccountsStakingPayouts,
	PalletsStakingProgress,
	PalletsStorage,
	NodeNetwork,
	NodeTransactionPool,
	NodeVersion,
	RuntimeCode,
	RuntimeMetadata,
	RuntimeSpec,
	TransactionDryRun,
	TransactionFeeEstimate,
	TransactionMaterial,
	TransactionSubmit,
	Paras,
};
