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
import type { ControllerOptions } from 'src/types/chains-config';
import { IAddressParam } from 'src/types/requests';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { validateAddress, validateBoolean, validateUseRcBlock } from '../../middleware';
import { AccountsStakingInfoService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET staking information for an address.
 *
 * Paths:
 * - `address`: The _Stash_ address for staking.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional) `useRcBlock`: When true, treats the `at` parameter as a relay chain block
 * 		to find corresponding Asset Hub blocks. Only supported for Asset Hub endpoints.
 * - (Optional) `includeClaimedRewards`: Controls whether or not the `claimedRewards`
 * 		field is included in the response. Defaults to `true`.
 * 		If set to `false`:
 * 		- the field `claimedRewards` will be omitted from the response and
 * 		- all internal calculations for claimed rewards in `AccountsStakingInfoService`
 * 		  will be skipped, potentially speeding up the response time.
 *
 * Returns:
 * - When using `useRcBlock=true`: An array of response objects, one for each Asset Hub block found
 *   in the specified relay chain block. Returns empty array `[]` if no Asset Hub blocks found.
 * - When using `useRcBlock=false` or omitted: A single response object.
 *
 * Response object structure:
 * - `at`: Block number and hash at which the call was made.
 * - `rewardDestination`: The account to which rewards will be paid. Can be 'Staked' (Stash
 *   account, adding to the amount at stake), 'Stash' (Stash address, not adding to the amount at
 *   stake), 'Controller' (Controller address), or 'Account(AccountId)' (address identified by AccountId).
 * - `controller`: Controller address for the given Stash.
 * - `numSlashingSpans`: Number of slashing spans on Stash account; `null` if provided address is
 *    not a Controller.
 * - `staking`: The staking ledger. Empty object if provided address is not a Controller.
 *   - `stash`: The stash account whose balance is actually locked and at stake.
 *   - `total`: The total amount of the stash's balance that we are currently accounting for.
 *     Simply `active + unlocking`.
 *   - `active`: The total amount of the stash's balance that will be at stake in any forthcoming
 *     eras.
 *   - `unlocking`: Any balance that is becoming free, which may eventually be transferred out of
 *     the stash (assuming it doesn't get slashed first). Represented as an array of objects, each
 *     with an `era` at which `value` will be unlocked.
 *   - `claimedRewards`: Array of eras for which the stakers behind a validator have claimed
 *     rewards. Only updated for _validators._
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock=true`.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock=true`.
 *
 * Note: Runtime versions of Kusama less than 1062 will either have `lastReward` in place of
 * `claimedRewards`, or no field at all. This is related to changes in reward distribution. See:
 * - Lazy Payouts: https://github.com/paritytech/substrate/pull/4474
 * - Simple Payouts: https://github.com/paritytech/substrate/pull/5406
 *
 * Substrate Reference:
 * - Staking Pallet: https://crates.parity.io/pallet_staking/index.html
 * - `RewardDestination`: https://crates.parity.io/pallet_staking/enum.RewardDestination.html
 * - `Bonded`: https://crates.parity.io/pallet_staking/struct.Bonded.html
 * - `StakingLedger`: https://crates.parity.io/pallet_staking/struct.StakingLedger.html
 */
export default class AccountsStakingInfoController extends AbstractController<AccountsStakingInfoService> {
	protected options: ControllerOptions;

	static controllerName = 'AccountsStakingInfo';
	static requiredPallets = [
		['Staking', 'System'],
		['ParachainStaking', 'ParachainSystem'],
		['ParachainStaking', 'System'],
		['Staking', 'ParachainSystem'],
	];
	constructor(api: string, options: ControllerOptions) {
		super(api, '/accounts/:address/staking-info', new AccountsStakingInfoService(api));
		this.initRoutes();
		this.options = options;
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateBoolean(['includeClaimedRewards']), validateUseRcBlock);

		this.safeMountAsyncGetHandlers([['', this.getAccountStakingInfo]]);
	}

	/**
	 * Get the latest account staking summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountStakingInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat, includeClaimedRewards } },
		res,
	): Promise<void> => {
		const { isAssetHubMigrated } = ApiPromiseRegistry.assetHubInfo;
		const includeClaimedRewardsArg = includeClaimedRewards !== 'false';
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsStakingInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsStakingInfoController.sanitizedSend(res, []);
				}
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				let result;
				if (isAssetHubMigrated) {
					result = await this.service.fetchAccountStakingInfoAssetHub(ahHash, includeClaimedRewardsArg, address);
				} else {
					result = await this.service.fetchAccountStakingInfo(ahHash, includeClaimedRewardsArg, address);
				}

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
				AccountsStakingInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsStakingInfoController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);

			let result;
			if (isAssetHubMigrated) {
				result = await this.service.fetchAccountStakingInfoAssetHub(hash, includeClaimedRewardsArg, address);
			} else {
				result = await this.service.fetchAccountStakingInfo(hash, includeClaimedRewardsArg, address);
			}

			AccountsStakingInfoController.sanitizedSend(res, result);
		}
	};
}
