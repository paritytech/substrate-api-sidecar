import { statemineAccountsApprovalsEndpoints } from './asset-approvals';
import { statemineAccountAssetBalanceEndpoints } from './asset-balances';

export const statemineAccountAssetEndpoints = [
	...statemineAccountAssetBalanceEndpoints,
	...statemineAccountsApprovalsEndpoints,
];
