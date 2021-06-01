import { ControllerConfig } from '../types/chains-config';

/**
 * Statemint configuration for Sidecar.
 */
export const westmineControllers: ControllerConfig = {
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
        'TransactionDryRun',
        'TransactionMaterial',
        'TransactionFeeEstimate',
        'TransactionSubmit',
    ],
    options: {
        finalizes: true,
        minCalcFeeRuntime: 0,
        blockWeightStore: {},
    },
};
