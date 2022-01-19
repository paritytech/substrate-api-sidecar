import { TAssetDepositBalance } from '@polkadot/types/interfaces';
import { AssetId } from '@polkadot/types/interfaces/runtime';
import { bool, u128 } from '@polkadot/types/primitive';

import { IAt } from '.';

export interface IAssetBalance {
	/**
	 * Identifier for the class of asset.
	 */
	assetId: AssetId | number;
	/**
	 * The units in which substrate records balances.
	 */
	balance: u128;
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
	isSufficient: bool | boolean;
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
 *
 * If an asset-approval does not exist, the `amount` and `deposit` will be null.
 */
export interface IAccountAssetApproval {
	at: IAt;
	amount: u128 | null;
	deposit: TAssetDepositBalance | null;
}
