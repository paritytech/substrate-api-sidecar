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

import BN from 'bn.js';
import { RequestHandler } from 'express';
import { IAddressParam } from 'src/types/requests';

import { validateAddress, validateUseRcBlock } from '../../middleware';
import { AccountsVestingInfoService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET vesting information for an address.
 *
 * Paths:
 * - `address`: Address to query.
 *
 * Query params:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional)`includeClaimable`: When set to 'true', calculates and includes vested
 *      amounts for each vesting schedule plus the claimable amount. This may require a
 *      relay chain connection for Asset Hub post-migration queries. Defaults to 'false'.
 * - (Optional)`useRcBlock`: When set to 'true', uses the relay chain block specified in the
 *      'at' parameter to determine corresponding Asset Hub block(s). Only supported for
 *      Asset Hub endpoints.
 *
 * Returns:
 * - When using `useRcBlock` parameter: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `at` parameter or no query params: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `vesting`: Array of vesting schedules for an account.
 *   - `locked`: Number of tokens locked at start.
 *   - `perBlock`: Number of tokens that gets unlocked every block after `startingBlock`.
 *   - `startingBlock`: Starting block for unlocking(vesting).
 *   - `vested`: (Only when `includeClaimable=true`) Amount that has vested based on time elapsed.
 * - `vestedBalance`: (Only when `includeClaimable=true`) Total vested across all schedules.
 * - `vestingTotal`: (Only when `includeClaimable=true`) Total locked across all schedules.
 * - `vestedClaimable`: (Only when `includeClaimable=true`) Actual amount that can be claimed now.
 * - `blockNumberForCalculation`: (Only when `includeClaimable=true`) The block number used for calculations.
 * - `blockNumberSource`: (Only when `includeClaimable=true`) Which chain's block number was used ('relay' or 'self').
 * - `rcBlockHash`: The relay chain block hash. Only present when `useRcBlock` parameter is used.
 * - `rcBlockNumber`: The relay chain block number. Only present when `useRcBlock` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock` parameter is used.
 *
 * Note: When `includeClaimable=true` for Asset Hub post-migration queries, a relay chain
 * connection is required since vesting schedules use relay chain block numbers.
 *
 * Substrate Reference:
 * - Vesting Pallet: https://crates.parity.io/pallet_vesting/index.html
 * - `VestingInfo`: https://crates.parity.io/pallet_vesting/struct.VestingInfo.html
 */
export default class AccountsVestingInfoController extends AbstractController<AccountsVestingInfoService> {
	static controllerName = 'AccountsVestingInfo';
	static requiredPallets = [['Vesting'], ['CalamariVesting']];

	constructor(api: string) {
		super(api, '/accounts/:address/vesting-info', new AccountsVestingInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateUseRcBlock);

		this.safeMountAsyncGetHandlers([['', this.getAccountVestingInfo]]);
	}

	/**
	 * Get vesting information for an account.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountVestingInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat, includeClaimable } },
		res,
	): Promise<void> => {
		const shouldIncludeClaimable = includeClaimable === 'true';
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsVestingInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsVestingInfoController.sanitizedSend(res, []);
				}
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				// Pass rcBlockNumber to skip relay block search when includeClaimable is used
				const result = await this.service.fetchAccountVestingInfo(
					ahHash,
					address,
					shouldIncludeClaimable,
					new BN(rcBlockNumber),
				);

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
				AccountsVestingInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsVestingInfoController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchAccountVestingInfo(hash, address, shouldIncludeClaimable);
			AccountsVestingInfoController.sanitizedSend(res, result);
		}
	};
}
