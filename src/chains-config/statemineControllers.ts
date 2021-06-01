import { ControllerConfig } from '../types/chains-config';

/**
 * Statemine configuration for Sidecar.
 */
export const statemineControllers: ControllerConfig = {
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
