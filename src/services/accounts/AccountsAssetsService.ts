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

import { ApiDecoration } from '@polkadot/api/types';
import { bool, Null, Struct, u128 } from '@polkadot/types';
import { StorageKey } from '@polkadot/types';
import { AssetId, BlockHash } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';

import { IAccountAssetApproval, IAccountAssetsBalances, IAssetBalance } from '../../types/responses';
import { AbstractService } from '../AbstractService';

/**
 * These two types (`PalletAssetsAssetBalance, LegacyPalletAssetsAssetBalance`) are necessary for any
 * runtime pre 9160. It excludes the `reason` field which v9160 introduces via the following PR.
 * https://github.com/paritytech/substrate/pull/10382/files#diff-9acae09f48474b7f0b96e7a3d66644e0ce5179464cbb0e00671ad09aa3f73a5fR88
 *
 * `LegacyPalletAssetsAssetBalance` which is the oldest historic type here had a `isSufficient`
 * key. It was then updated to be `sufficient` which we represent here within `PalletAssetsAssetBalance`.
 *
 * v9160 removes the `sufficient` key typed as a boolean, and instead
 * replaces it with a `reason` key. `reason` is an enum and has the following values
 * in polkadot-js: (`isConsumer`, `isSufficient`, `isDepositHeld`, `asDepositHeld`, `isDepositRefunded`, `type`).
 *
 * For v9160 and future runtimes, the returned type is `PalletAssetsAssetAccount`.
 */
interface PalletAssetsAssetBalance extends Struct {
	readonly balance: u128;
	readonly isFrozen: bool;
	readonly sufficient: bool;
	readonly extra: Null;
}

interface LegacyPalletAssetsAssetBalance extends Struct {
	readonly balance: u128;
	readonly isFrozen: bool;
	readonly isSufficient: bool;
}

export class AccountsAssetsService extends AbstractService {
	/**
	 * Fetch all the `AssetBalance`s alongside their `AssetId`'s for a given array of queried `AssetId`'s.
	 * If none are queried the function will get all `AssetId`'s associated with the
	 * given `AccountId`, and send back all the `AssetsBalance`s.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address `AccountId` associated with the balances
	 * @param assets An array of `assetId`'s to be queried. If the length is zero
	 * all assetId's associated to the account will be queried
	 */
	async fetchAssetBalances(hash: BlockHash, address: string, assets: number[]): Promise<IAccountAssetsBalances> {
		const { api } = this;
		const historicApi = await api.at(hash);

		// Check if this runtime has the assets pallet
		this.checkAssetsError(historicApi);

		const { number } = await api.rpc.chain.getHeader(hash);

		let response;
		if (assets.length === 0) {
			/**
			 * This will query all assets and return them in an array
			 */
			const keys = await historicApi.query.assets.asset.keys();
			const assetIds = this.extractAssetIds(keys);

			response = await this.queryAssets(historicApi, assetIds, address);
		} else {
			/**
			 * This will query all assets by the requested AssetIds
			 */
			response = await this.queryAssets(historicApi, assets, address);
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			assets: response,
		};
	}

	/**
	 * Fetch all `AccountApproval`'s with a given `AssetId` and a `AssetApprovalKey`
	 * which consists of a `delegate` and an `owner`
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address `AccountId` or owner associated with the approvals
	 * @param assetId `AssetId` associated with the `AssetApproval`
	 * @param delegate `delegate`
	 */
	async fetchAssetApproval(
		hash: BlockHash,
		address: string,
		assetId: number,
		delegate: string,
	): Promise<IAccountAssetApproval> {
		const { api } = this;
		const historicApi = await api.at(hash);

		// Check if this runtime has the assets pallet
		this.checkAssetsError(historicApi);

		const [{ number }, assetApproval] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.assets.approvals(assetId, address, delegate),
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		let amount = null,
			deposit = null;
		if (assetApproval.isSome) {
			({ amount, deposit } = assetApproval.unwrap());
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			amount,
			deposit,
		};
	}

	/**
	 * Takes in an array of `AssetId`s, and an `AccountId` and returns
	 * all balances tied to those `AssetId`s.
	 *
	 * @param api ApiPromise
	 * @param assets An Array of `AssetId`s or numbers representing `assetId`s
	 * @param address An `AccountId` associated with the queried path
	 */
	async queryAssets(
		historicApi: ApiDecoration<'promise'>,
		assets: AssetId[] | number[],
		address: string,
	): Promise<IAssetBalance[]> {
		return Promise.all(
			assets.map(async (assetId: AssetId | number) => {
				const assetBalance = await historicApi.query.assets.account(assetId, address);

				/**
				 * The following checks for three different cases:
				 */

				// 1. Via runtime v9160 the updated storage introduces a `reason` field,
				// and polkadot-js wraps the newly returned `PalletAssetsAssetAccount` in an `Option`.
				if (assetBalance.isSome) {
					const balanceProps = assetBalance.unwrap();

					let isFrozen: bool | string;
					if ('isFrozen' in balanceProps) {
						isFrozen = balanceProps.isFrozen as bool;
					} else {
						isFrozen = 'isFrozen does not exist for this runtime';
					}

					return {
						assetId,
						balance: balanceProps.balance,
						isFrozen: isFrozen,
						isSufficient: balanceProps.reason.isSufficient,
					};
				}

				// 2. `query.assets.account()` return `PalletAssetsAssetBalance` which exludes `reasons` but has
				// `sufficient` as a key.
				if ((assetBalance as unknown as PalletAssetsAssetBalance).sufficient) {
					const balanceProps = assetBalance as unknown as PalletAssetsAssetBalance;

					return {
						assetId,
						balance: balanceProps.balance,
						isFrozen: balanceProps.isFrozen,
						isSufficient: balanceProps.sufficient,
					};
				}

				// 3. The older legacy type of `PalletAssetsAssetBalance` has a key of `isSufficient` instead
				// of `sufficient`.
				if (assetBalance['isSufficient'] as bool) {
					const balanceProps = assetBalance as unknown as LegacyPalletAssetsAssetBalance;

					return {
						assetId,
						balance: balanceProps.balance,
						isFrozen: balanceProps.isFrozen,
						isSufficient: balanceProps.isSufficient,
					};
				}

				/**
				 * This return value wont ever be reached as polkadot-js defaults the
				 * `balance` value to `0`, `isFrozen` to false, and `isSufficient` to false.
				 * This ensures that the typescript compiler is happy, but we also follow along
				 * with polkadot-js/substrate convention.
				 */
				return {
					assetId,
					balance: historicApi.registry.createType('u128', 0),
					isFrozen: historicApi.registry.createType('bool', false),
					isSufficient: historicApi.registry.createType('bool', false),
				};
			}),
		).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});
	}

	/**
	 * @param keys Extract `assetId`s from an array of storage keys
	 */
	extractAssetIds(keys: StorageKey<[AssetId]>[]): AssetId[] {
		return keys.map(({ args: [assetId] }) => assetId);
	}

	/**
	 * Checks if the historicApi has the assets pallet. If not
	 * it will throw a BadRequest error.
	 *
	 * @param historicApi Decorated historic api
	 */
	private checkAssetsError(historicApi: ApiDecoration<'promise'>): void {
		if (!historicApi.query.assets) {
			throw new BadRequest(`The runtime does not include the assets pallet at this block.`);
		}
	}
}
