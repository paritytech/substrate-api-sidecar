// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
	isFrozen: bool | string;
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
