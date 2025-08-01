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
import { AccountsAssetsService } from '../../services/accounts';
import AbstractController from '../AbstractController';

/**
 * Get asset information for an address.
 *
 * Paths:
 * - `address`: The address to query
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional) `useRcBlock`: When true, treats the `at` parameter as a relay chain block
 *  	to find corresponding Asset Hub blocks. Only supported for Asset Hub endpoints.
 * - (Optional for `/accounts/:address/asset-balances`)`assets`
 * - (Required for `/accounts/:address/asset-approvals)`assetId` The assetId associated
 * 		with the `AssetApproval`.
 * - (Required for `/accounts/:address/asset-approvals)`delegate` The delegate associated
 * 		with the `ApprovalKey` which is tied to a `Approval`. The `ApprovalKey` consists
 * 		of an `owner` which is the `address` path parameter, and a `delegate`.
 *
 * `/accounts/:address/asset-balances`
 * Returns:
 * - When using `useRcBlock=true`: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `useRcBlock=false` or omitted: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `assets`: An array of `AssetBalance` objects which have a AssetId attached to them
 * 		- `assetId`: The identifier of the asset.
 * 		- `balance`: The balance of the asset.
 * 		- `isFrozen`: Whether the asset is frozen for non-admin transfers.
 * 		- `isSufficient`: Whether a non-zero balance of this asset is a deposit of sufficient
 * 			value to account for the state bloat associated with its balance storage. If set to
 *			`true`, then non-zero balances may be stored without a `consumer` reference (and thus
 * 			an ED in the Balances pallet or whatever else is used to control user-account state
 *			growth).
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock=true`.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock=true`.
 *
 * `/accounts/:address/asset-approvals`
 * Returns:
 * - When using `useRcBlock=true`: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `useRcBlock=false` or omitted: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `amount`: The amount of funds approved for the balance transfer from the owner
 * 		to some delegated target.
 * - `deposit`: The amount reserved on the owner's account to hold this item in storage.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock=true`.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock=true`.
 *
 * Substrate Reference:
 * - Assets Pallet: https://crates.parity.io/pallet_assets/index.html
 * - `AssetBalance`: https://crates.parity.io/pallet_assets/struct.AssetBalance.html
 * - `ApprovalKey`: https://crates.parity.io/pallet_assets/struct.ApprovalKey.html
 * - `Approval`: https://crates.parity.io/pallet_assets/struct.Approval.html
 *
 */
export default class AccountsAssetsController extends AbstractController<AccountsAssetsService> {
	static controllerName = 'AccountsAssets';
	static requiredPallets = [['Assets']];

	constructor(api: string) {
		super(api, '/accounts/:address', new AccountsAssetsService(api));
		this.initRoutes();
	}
	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateUseRcBlock);

		this.safeMountAsyncGetHandlers([
			['/asset-balances', this.getAssetBalances],
			['/asset-approvals', this.getAssetApprovals],
		]);
	}

	private getAssetBalances: RequestHandler = async (
		{ params: { address }, query: { at, useRcBlock, assets } },
		res,
	): Promise<void> => {
		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				AccountsAssetsController.sanitizedSend(res, []);
				return;
			}

			const assetsArray = Array.isArray(assets) ? this.parseQueryParamArrayOrThrow(assets as string[]) : [];

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchAssetBalances(ahHash, address, assetsArray);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			AccountsAssetsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const assetsArray = Array.isArray(assets) ? this.parseQueryParamArrayOrThrow(assets as string[]) : [];
			const result = await this.service.fetchAssetBalances(hash, address, assetsArray);
			AccountsAssetsController.sanitizedSend(res, result);
		}
	};

	private getAssetApprovals: RequestHandler = async (
		{ params: { address }, query: { at, useRcBlock, delegate, assetId } },
		res,
	): Promise<void> => {
		if (typeof delegate !== 'string' || typeof assetId !== 'string') {
			throw new BadRequest('Must include a `delegate` and `assetId` query param');
		}

		const id = this.parseNumberOrThrow(assetId, '`assetId` provided is not a number.');

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				AccountsAssetsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchAssetApproval(ahHash, address, id, delegate);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			AccountsAssetsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchAssetApproval(hash, address, id, delegate);
			AccountsAssetsController.sanitizedSend(res, result);
		}
	};
}
