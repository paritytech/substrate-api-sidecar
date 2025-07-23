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

import { validateUseRcBlock } from '../../middleware';
import { PalletsPoolAssetsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET asset information for a single pool asset.
 *
 * Paths:
 * - `assetId`: The identifier of the pool asset.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 *
 * `/pallets/pool-assets/:assetId/asset-info`
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `poolAssetInfo`: All details concering a pool asset.
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
 * 		- `status`: The status of the asset.
 * - `poolAssetMetadata`: All metadata concerning a pool asset.
 * 		- `deposit`: The balance deposited for this metadata. This pays for the data
 * 			stored in this struct.
 * 		- `name`: The user friendly name of this pool asset.
 * 		- `symbol`: The ticker symbol for this pool asset.
 * 		- `decimals`: The number of decimals this pool asset uses to represent one unit.
 * 		- `isFrozen`: Whether the pool asset metadata may be changed by a non Force origin.
 *
 * Substrate References:
 * - PoolAssets Pallet: instance of Assets Pallet https://crates.parity.io/pallet_assets/index.html
 * - `AssetMetadata`: https://crates.parity.io/pallet_assets/struct.AssetMetadata.html
 * - `AssetDetails`: https://crates.parity.io/pallet_assets/struct.AssetDetails.html
 */
export default class PalletsPoolAssetsController extends AbstractController<PalletsPoolAssetsService> {
	static controllerName = 'PalletsPoolAssets';
	static requiredPallets = [['PoolAssets']];
	constructor(api: string) {
		super(api, '/pallets/pool-assets/:assetId', new PalletsPoolAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([['/asset-info', this.getPoolAssetById]]);
	}

	private getPoolAssetById: RequestHandler = async (
		{ params: { assetId }, query: { at, useRcBlock } },
		res,
	): Promise<void> => {
		/**
		 * Verify our param `assetId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(assetId, '`assetId` path param is not a number');

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsPoolAssetsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchPoolAssetById(ahHash, index);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			PalletsPoolAssetsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchPoolAssetById(hash, index);
			PalletsPoolAssetsController.sanitizedSend(res, result);
		}
	};
}
