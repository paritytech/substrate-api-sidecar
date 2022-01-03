import { TAssetDepositBalance } from '@polkadot/types/interfaces';
import { AssetId } from '@polkadot/types/interfaces/runtime';
import { bool, u128 } from '@polkadot/types/primitive';
import { PalletAssetsExistenceReason } from '@polkadot/types/lookup'

import { IAt } from '.';

export interface IAssetBalance {
	/**
	 * Identifier for the class of asset.
	 */
	assetId: AssetId | number;
	/**
	 * The units in which substrate records balances.
	 */
	balance: u128 | null;
	/**
	 * Whether this asset class is frozen except for permissioned/admin instructions.
	 */
	isFrozen: bool | null;
	/**
	 * The reason for the existence of the account.
	 */
	reason: PalletAssetsExistenceReason | null;
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
