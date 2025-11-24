// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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
import { BlockHash } from '@polkadot/types/interfaces';
import { AnyJson, AnyTuple } from '@polkadot/types-codec/types';
import { BadRequest } from 'http-errors';

import { IAccountForeignAssetsBalances, IForeignAssetBalance } from '../../types/responses';
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

export class AccountsForeignAssetsService extends AbstractService {
	/**
	 * Fetch all the `ForeignAssetBalance`s for a given account address.
	 * If specific foreign assets are queried via multilocations, only those will be returned.
	 * Otherwise, all foreign asset balances for the account will be returned.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address `AccountId` associated with the balances
	 * @param foreignAssets An array of multilocation objects to be queried as JSON strings. If the length is zero
	 * all foreign assets associated to the account will be queried
	 */
	async fetchForeignAssetBalances(
		hash: BlockHash,
		address: string,
		foreignAssets: string[],
	): Promise<IAccountForeignAssetsBalances> {
		const { api } = this;
		const [historicApi, { number }] = await Promise.all([api.at(hash), api.rpc.chain.getHeader(hash)]);

		// Check if this runtime has the foreignAssets pallet
		this.checkForeignAssetsError(historicApi);

		let response;
		if (foreignAssets.length === 0) {
			/**
			 * This will query all foreign assets and then filter for the account's holdings
			 * We need to get all foreign assets first, then check which ones the account holds
			 */
			const foreignAssetEntries = await historicApi.query.foreignAssets.asset.entries();
			const multiLocations = this.extractMultiLocationsFromAssetEntries(foreignAssetEntries);

			response = await this.queryForeignAssets(historicApi, multiLocations, address);
		} else {
			/**
			 * This will query all foreign assets by the requested multilocations
			 */
			const parsedMultiLocations = foreignAssets.map((ml) => {
				try {
					return JSON.parse(ml) as AnyJson;
				} catch (err) {
					throw new BadRequest(`Invalid JSON format for multilocation: ${ml}`);
				}
			});
			response = await this.queryForeignAssets(historicApi, parsedMultiLocations, address);
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			foreignAssets: response,
		};
	}

	/**
	 * Takes in an array of multilocations and an `AccountId` and returns
	 * all balances tied to those foreign assets.
	 *
	 * Uses batch queries (.multi()) for better performance instead of individual queries.
	 *
	 * @param historicApi ApiPromise at a specific block
	 * @param multiLocations An Array of multilocation objects
	 * @param address An `AccountId` associated with the queried path
	 */
	async queryForeignAssets(
		historicApi: ApiDecoration<'promise'>,
		multiLocations: AnyJson[],
		address: string,
	): Promise<IForeignAssetBalance[]> {
		// Prepare all queries for batch call
		const queries = multiLocations.map((multiLocation) => {
			// Remove commas from multilocation key values e.g. Parachain: 2,125 -> Parachain: 2125
			const multiLocationStr = JSON.stringify(multiLocation).replace(/(\d),/g, '$1');
			const parsedMultiLocation = JSON.parse(multiLocationStr) as AnyJson;
			return [parsedMultiLocation, address];
		});

		// Single batched RPC call instead of N individual calls
		const assetBalances = await historicApi.query.foreignAssets.account.multi(queries).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		// Process all results
		const results = multiLocations.map((multiLocation, index) => {
			const assetBalance = assetBalances[index];

			/**
			 * The following checks for three different cases:
			 * We need to use 'any' here because polkadot-js returns different types
			 * depending on the runtime version, and we need to check dynamically
			 */

			// 1. Via runtime v9160 the updated storage introduces a `reason` field,
			// and polkadot-js wraps the newly returned `PalletAssetsAssetAccount` in an `Option`.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			if ((assetBalance as any).isSome) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
				const balanceProps = (assetBalance as any).unwrap();

				let isFrozen: bool | string;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if ('isFrozen' in balanceProps) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					isFrozen = balanceProps.isFrozen as bool;
				} else {
					isFrozen = 'isFrozen does not exist for this runtime';
				}

				return {
					multiLocation,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					balance: balanceProps.balance,
					isFrozen: isFrozen,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					isSufficient: balanceProps.reason.isSufficient,
				};
			}

			// 2. `query.foreignAssets.account()` return `PalletAssetsAssetBalance` which excludes `reasons` but has
			// `sufficient` as a key.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			const balanceAny = assetBalance as any;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (balanceAny.sufficient !== undefined) {
				const balanceProps = assetBalance as unknown as PalletAssetsAssetBalance;

				return {
					multiLocation,
					balance: balanceProps.balance,
					isFrozen: balanceProps.isFrozen,
					isSufficient: balanceProps.sufficient,
				};
			}

			// 3. The older legacy type of `PalletAssetsAssetBalance` has a key of `isSufficient` instead
			// of `sufficient`.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (balanceAny.isSufficient !== undefined) {
				const balanceProps = assetBalance as unknown as LegacyPalletAssetsAssetBalance;

				return {
					multiLocation,
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
				multiLocation,
				balance: historicApi.registry.createType('u128', 0),
				isFrozen: historicApi.registry.createType('bool', false),
				isSufficient: historicApi.registry.createType('bool', false),
			};
		});

		// Filter out assets with zero balance
		// We filter here because querying all foreign assets will return many zeros
		// for assets the account doesn't hold
		return results.filter((asset) => {
			// Check if balance is greater than zero
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			return !asset.balance.isZero();
		});
	}

	/**
	 * Extract multilocations from foreign asset entries
	 * The storage key for foreignAssets.asset is just the multilocation
	 *
	 * @param entries Foreign asset storage entries
	 */
	extractMultiLocationsFromAssetEntries(entries: [StorageKey<AnyTuple>, unknown][]): AnyJson[] {
		const multiLocations: AnyJson[] = [];

		for (const [storageKey] of entries) {
			const keyHuman = storageKey.toHuman();

			// For foreignAssets.asset, the key is an array with the multilocation as first element
			if (Array.isArray(keyHuman) && keyHuman.length >= 1) {
				multiLocations.push(keyHuman[0] as unknown as AnyJson);
			}
		}

		return multiLocations;
	}

	/**
	 * Checks if the historicApi has the foreignAssets pallet. If not
	 * it will throw a BadRequest error.
	 *
	 * @param historicApi Decorated historic api
	 */
	private checkForeignAssetsError(historicApi: ApiDecoration<'promise'>): void {
		if (!historicApi.query.foreignAssets) {
			throw new BadRequest(`The runtime does not include the foreignAssets pallet at this block.`);
		}
	}
}
