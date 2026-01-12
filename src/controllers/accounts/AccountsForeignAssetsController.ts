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

import { RequestHandler } from 'express';

import { validateAddress, validateUseRcBlock } from '../../middleware';
import { AccountsForeignAssetsService } from '../../services/accounts';
import AbstractController from '../AbstractController';

/**
 * Get foreign asset balance information for an address.
 *
 * Paths:
 * - `address`: The address to query
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve balance information. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional) `useRcBlock`: When true, treats the `at` parameter as a relay chain block
 *  	to find corresponding Asset Hub blocks. Only supported for Asset Hub endpoints.
 * - (Optional)`foreignAssets`: Comma-separated list of multilocation JSON strings to filter by.
 *    If not provided, all foreign asset balances for the account will be returned.
 *
 * `/accounts/:address/foreign-asset-balances`
 * Returns:
 * - When using `useRcBlock=true`: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `useRcBlock=false` or omitted: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `foreignAssets`: An array of `ForeignAssetBalance` objects which have a multilocation attached to them
 * 		- `multiLocation`: The multilocation identifier of the foreign asset.
 * 		- `balance`: The balance of the foreign asset.
 * 		- `isFrozen`: Whether the asset is frozen for non-admin transfers.
 * 		- `isSufficient`: Whether a non-zero balance of this asset is a deposit of sufficient
 * 			value to account for the state bloat associated with its balance storage. If set to
 *			`true`, then non-zero balances may be stored without a `consumer` reference (and thus
 * 			an ED in the Balances pallet or whatever else is used to control user-account state
 *			growth).
 * - `rcBlockHash`: The relay chain block hash used for the query. Only present when `useRcBlock=true`.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock=true`.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock=true`.
 *
 * Substrate Reference:
 * - ForeignAssets Pallet: https://crates.parity.io/pallet_assets/index.html
 * - `AssetBalance`: https://crates.parity.io/pallet_assets/struct.AssetBalance.html
 * - XCM Multilocations: https://wiki.polkadot.network/docs/learn-xcm
 *
 */
export default class AccountsForeignAssetsController extends AbstractController<AccountsForeignAssetsService> {
	static controllerName = 'AccountsForeignAssets';
	static requiredPallets = [['ForeignAssets']];

	constructor(api: string) {
		super(api, '/accounts/:address', new AccountsForeignAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateUseRcBlock);

		this.safeMountAsyncGetHandlers([['/foreign-asset-balances', this.getForeignAssetBalances]]);
	}

	private getForeignAssetBalances: RequestHandler = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat, foreignAssets } },
		res,
	): Promise<void> => {
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsForeignAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsForeignAssetsController.sanitizedSend(res, []);
				}
				return;
			}

			const foreignAssetsArray = Array.isArray(foreignAssets) ? (foreignAssets as string[]) : [];

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchForeignAssetBalances(ahHash, address, foreignAssetsArray);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockHash: rcBlockHash.toString(),
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			// Send response based on format
			if (useObjectFormat) {
				const rcBlockInfo = await this.getRcBlockInfo(at);
				AccountsForeignAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsForeignAssetsController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);
			const foreignAssetsArray = Array.isArray(foreignAssets) ? (foreignAssets as string[]) : [];
			const result = await this.service.fetchForeignAssetBalances(hash, address, foreignAssetsArray);
			AccountsForeignAssetsController.sanitizedSend(res, result);
		}
	};
}
