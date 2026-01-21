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
import { BadRequest } from 'http-errors';

import { validateAddress, validateUseRcBlock } from '../../middleware';
import { AccountsPoolAssetsService } from '../../services/accounts';
import AbstractController from '../AbstractController';

/**
 * Get pool asset information for an address.
 *
 * Paths:
 * - `address`: The address to query
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional)`useRcBlock`: When set to 'true', uses the relay chain block specified in the 'at' parameter to determine corresponding Asset Hub block(s). Only supported for Asset Hub endpoints.
 * - (Optional for `/accounts/:address/pool-asset-balances`)`assets`
 * - (Required for `/accounts/:address/pool-asset-approvals)`assetId` The assetId associated
 * 		with the `AssetApproval`.
 * - (Required for `/accounts/:address/pool-asset-approvals)`delegate` The delegate associated
 * 		with the `ApprovalKey` which is tied to a `Approval`. The `ApprovalKey` consists
 * 		of an `owner` which is the `address` path parameter, and a `delegate`.
 *
 * `/accounts/:address/pool-asset-balances`
 * Returns:
 * - When using `useRcBlock` parameter: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `at` parameter or no query params: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `poolAssets`: An array of `AssetBalance` objects which have a AssetId attached to them
 * 		- `assetId`: The identifier of the asset.
 * 		- `balance`: The balance of the asset.
 * 		- `isFrozen`: Whether the pool asset is frozen for non-admin transfers.
 * 		- `isSufficient`: Whether a non-zero balance of this pool asset is a deposit of sufficient
 * 			value to account for the state bloat associated with its balance storage. If set to
 *			`true`, then non-zero balances may be stored without a `consumer` reference (and thus
 * 			an ED in the Balances pallet or whatever else is used to control user-account state
 *			growth).
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock` parameter is used.
 *
 * `/accounts/:address/pool-asset-approvals`
 * Returns:
 * - When using `useRcBlock` parameter: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `at` parameter or no query params: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `amount`: The amount of funds approved for the balance transfer from the owner
 * 		to some delegated target.
 * - `deposit`: The amount reserved on the owner's account to hold this item in storage.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock` parameter is used.
 *
 * Substrate Reference:
 * - PoolAssets Pallet: instance of Assets Pallet https://crates.parity.io/pallet_assets/index.html
 * - `AssetBalance`: https://crates.parity.io/pallet_assets/struct.AssetBalance.html
 * - `ApprovalKey`: https://crates.parity.io/pallet_assets/struct.ApprovalKey.html
 * - `Approval`: https://crates.parity.io/pallet_assets/struct.Approval.html
 *
 */
export default class AccountsPoolAssetsController extends AbstractController<AccountsPoolAssetsService> {
	static controllerName = 'AccountsPoolAssets';
	static requiredPallets = [['PoolAssets', 'Assets']];
	constructor(api: string) {
		super(api, '/accounts/:address', new AccountsPoolAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateUseRcBlock);

		this.safeMountAsyncGetHandlers([
			['/pool-asset-balances', this.getPoolAssetBalances],
			['/pool-asset-approvals', this.getPoolAssetApprovals],
		]);
	}

	private getPoolAssetBalances: RequestHandler = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat, assets } },
		res,
	): Promise<void> => {
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsPoolAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsPoolAssetsController.sanitizedSend(res, []);
				}
				return;
			}

			const assetsArray = Array.isArray(assets) ? this.parseQueryParamArrayOrThrow(assets as string[]) : [];

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchPoolAssetBalances(ahHash, address, assetsArray);

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
				AccountsPoolAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsPoolAssetsController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);
			const assetsArray = Array.isArray(assets) ? this.parseQueryParamArrayOrThrow(assets as string[]) : [];
			const result = await this.service.fetchPoolAssetBalances(hash, address, assetsArray);
			AccountsPoolAssetsController.sanitizedSend(res, result);
		}
	};

	private getPoolAssetApprovals: RequestHandler = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat, delegate, assetId } },
		res,
	): Promise<void> => {
		if (typeof delegate !== 'string' || typeof assetId !== 'string') {
			throw new BadRequest('Must include a `delegate` and `assetId` query param');
		}

		const id = this.parseNumberOrThrow(assetId, '`assetId` provided is not a number.');
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsPoolAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsPoolAssetsController.sanitizedSend(res, []);
				}
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchPoolAssetApprovals(ahHash, address, id, delegate);

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
				AccountsPoolAssetsController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsPoolAssetsController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchPoolAssetApprovals(hash, address, id, delegate);
			AccountsPoolAssetsController.sanitizedSend(res, result);
		}
	};
}
