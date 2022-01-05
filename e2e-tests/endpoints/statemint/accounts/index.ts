import { statemintAccountsApprovalsEndpoints } from './asset-approvals';
import { statemintAccountAssetBalanceEndpoints } from './asset-balances';

export const statemintAccountAssetEndpoints = [
	...statemintAccountAssetBalanceEndpoints,
	...statemintAccountsApprovalsEndpoints,
];
