import { ControllerConfig } from '../types/chains-config';

export const kulupuControllers: ControllerConfig = {
	Blocks: false,
	KulupuBlocks: true,
	AccountsStakingPayouts: false,
	AccountsBalanceInfo: true,
	AccountsStakingInfo: false,
	AccountsVestingInfo: false,
	NodeNetwork: true,
	NodeVersion: true,
	NodeTransactionPool: true,
	RuntimeCode: true,
	RuntimeSpec: true,
	RuntimeMetadata: true,
	TransactionDryRun: true,
	TransactionMaterial: true,
	TransactionFeeEstimate: true,
	TransactionSubmit: true,
	PalletsStakingProgress: false,
	PalletsStorage: true,
};
