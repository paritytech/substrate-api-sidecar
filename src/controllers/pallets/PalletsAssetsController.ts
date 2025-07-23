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

import { validateRcAt } from '../../middleware';
import { PalletsAssetsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET asset information for a single asset.
 *
 * Paths:
 * - `assetId`: The identifier of the asset.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional)`rcAt`: Relay chain block at which to retrieve Asset Hub asset info. Only supported
 * 		for Asset Hub endpoints. Cannot be used with 'at' parameter.
 *
 * `/pallets/assets/:assetId/asset-info`
 * Returns:
 * - When using `rcAt` parameter: An array of response objects, one for each Asset Hub block found 
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `at` parameter or no query params: A single response object.
 * 
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `assetInfo`: All details concering an asset.
 * 		- `owner`: Owner of the assets privileges.
 * 		- `issuer`: The `AccountId` able to mint tokens.
 * 		- `admin`: The `AccountId` can that thaw tokens, force transfers and burn token from
 * 			any account.
 * 		- `freezer`: The `AccountId` that can freeze tokens.
 * 		- `supply`: The total supply across accounts.
 * 		- `deposit`: The balance deposited for this. This pays for the data stored.
 * 		- `minBalance`: The ED for virtual accounts.
 * 		- `isSufficient`: If `true`, then any account with this asset is given a provider reference. Otherwise, it
 * 			requires a consumer reference.
 * 		- `accounts`: The total number of accounts.
 * 		- `sufficients`: The total number of accounts for which is placed a self-sufficient reference.
 * 		- `approvals`: The total number of approvals.
 * 		- `isFrozen`: Whether the asset is frozen for non-admin transfers.
 * - `assetMetadata`: All metadata concerning an asset.
 * 		- `deposit`: The balance deposited for this metadata. This pays for the data
 * 			stored in this struct.
 * 		- `name`: The user friendly name of this asset.
 * 		- `symbol`: The ticker symbol for this asset.
 * 		- `decimals`: The number of decimals this asset uses to represent one unit.
 * 		- `isFrozen`: Whether the asset metadata may be changed by a non Force origin.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `rcAt` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `rcAt` parameter is used.
 *
 * Substrate References:
 * - Assets Pallet: https://crates.parity.io/pallet_assets/index.html
 * - `AssetMetadata`: https://crates.parity.io/pallet_assets/struct.AssetMetadata.html
 * - `AssetDetails`: https://crates.parity.io/pallet_assets/struct.AssetDetails.html
 */
export default class PalletsAssetsController extends AbstractController<PalletsAssetsService> {
	static controllerName = 'PalletsAssets';
	static requiredPallets = [['Assets']];
	constructor(api: string) {
		super(api, '/pallets/assets/:assetId', new PalletsAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([['/asset-info', this.getAssetById]]);
	}

	private getAssetById: RequestHandler = async ({ params: { assetId }, query: { at, rcAt } }, res): Promise<void> => {
		/**
		 * Verify our param `assetId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(assetId, '`assetId` path param is not a number');

		if (rcAt) {
			const rcAtResults = await this.getHashFromRcAt(rcAt);
			
			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsAssetsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchAssetById(ahHash, index);
				
				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			PalletsAssetsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchAssetById(hash, index);
			PalletsAssetsController.sanitizedSend(res, result);
		}
	};
}
