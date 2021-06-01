import { ControllerConfig } from '../types/chains-config';

/**
 * Statemint configuration for Sidecar.
 */
export const statemintControllers: ControllerConfig = {
	controllers: [
		'Blocks',
		'BlocksExtrinsics',
		'AccountsAssets',
		'PalletsAssets',
		'NodeNetwork',
		'NodeVersion',
		'NodeTransactionPool',
		'RuntimeCode',
		'RuntimeSpec',
		'RuntimeMetadata',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 0,
		blockWeightStore: {},
	},
};
