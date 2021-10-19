import { statemineAccountAssetBalanceEndpoints } from './asset-balances';
import { statemineAccountsApprovalsEndpoints } from './asset-approvals';

export const statemineAccountAssetEndpoints = [
    ...statemineAccountAssetBalanceEndpoints,
    ...statemineAccountsApprovalsEndpoints
];
