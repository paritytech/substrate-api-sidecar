import {
	TAssetBalance,
	TAssetDepositBalance,
} from '@polkadot/types/interfaces';
import { AssetId } from '@polkadot/types/interfaces/runtime';
import { bool } from '@polkadot/types/primitive';

import { IAt } from '.';

export interface IAssetBalance {
	/**
	 * Identifier for the class of asset.
	 */
	assetId: AssetId | number;
	/**
	 * The units in which substrate record's balances.
	 */
	balance: TAssetBalance;
	/**
	 * Whether this asset class is frozen except for permissioned/admin instructions.
	 */
	isFrozen: bool;
	/**
	 * Whether a non-zero balance of this asset is deposit of sufficient
	 * value to account for the state bloat associated with its balance storage. If set to
	 * `true`, then non-zero balances may be stored without a `consumer` reference (and thus
	 * an ED in the Balances pallet or whatever else is used to control user-account state
	 * growth).
	 */
	isSufficient: bool;
}

/**
 * Response from `/accounts/{accountId}/assets-balances?asset=assetId`
 */
export interface IAccountAssetsBalances {
	at: IAt;
	assets: IAssetBalance[];
}

/**
 * Response from `/accounts/{accountId}/asset-approvals?asset=assetId&delegate=accountId`
 */
export interface IAccountAssetApproval {
	at: IAt;
	amount: TAssetBalance;
	deposit: TAssetDepositBalance;
}
