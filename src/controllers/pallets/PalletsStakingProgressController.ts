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

import { BlockHash } from '@polkadot/types/interfaces';
import { RequestHandler } from 'express';

import { validateRcAt } from '../../middleware';
import { PalletsStakingProgressService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET progress on the general Staking pallet system.
 *
 * Query params:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `activeEra`: `EraIndex` of the era being rewarded.
 * - `forceEra`: Current status of era forcing.
 * - `nextActiveEraEstimate`: **Upper bound estimate** of the block height at which the next
 *   active era will start. Not included in response when `forceEra.isForceNone`.
 * - `nextSessionEstimate`: **Upper bound estimate** of the block height at which the next
 *   session will start.
 * - `unappliedSlashes`: Array of upcoming `UnappliedSlash` indexed by era. Each `UnappliedSlash`
 *   contains:
 * 		- `validator`: Stash account ID of the offending validator.
 *		- `own`: The amount the validator will be slashed.
 *		- `others`: Array of tuples of (accountId, amount) representing all the stashes of other
 *     slashed stakers and the amount they will be slashed.
 *		- `reporters`: Array of account IDs of the reporters of the offense.
 *		- `payout`: Amount of bounty payout to reporters.
 * - `electionStatus`: Information about the off-chain election. Not included in response when
 *   `forceEra.isForceNone`. Response includes:
 *		- `status`: Era election status; either `Close: null` or `Open: <BlockNumber>`. A status of
 *		`Close` indicates that the submission window for solutions from off-chain Phragmen is not
 *		open. A status of `Open` indicates the submission window for off-chain Phragmen solutions
 *		has been open since BlockNumber. N.B. when the submission window is open, certain
 *		extrinsics are not allowed because they would mutate the state that the off-chain Phragmen
 * 		calculation relies on for calculating results.
 *		- `toggleEstimate`: **Upper bound estimate** of the block height at which the `status` will
 *    switch.
 * - `idealValidatorCount`: Upper bound of validator set size; considered the ideal size. Not
 *   included in response when `forceEra.isForceNone`.
 * - `validatorSet`: Stash account IDs of the validators for the current session. Not included in
 *   response when `forceEra.isForceNone`.
 *
 * Note about 'active' vs. 'current' era: The _active_ era is the era currently being rewarded.
 * That is, an elected validator set will be in place for an entire active era, as long as none
 * are kicked out due to slashing. Elections take place at the end of each _current_ era, which
 * is the latest planned era, and may not equal the active era. Normally, the current era index
 * increments one session before the active era, in order to perform the election and queue the
 * validator set for the next active era. For example:
 *
 * ```
 * Time: --------->
 * CurrentEra:            1              |              2              |
 * ActiveEra:   |              1              |              2              |
 * SessionIdx:  |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11 | 12 | 13 | 14 |
 * Elections:                           ^                             ^
 * Set Changes:                               ^                             ^
 * ```
 *
 * Substrate Reference:
 * - Staking Pallet: https://crates.parity.io/pallet_staking/index.html
 * - Session Pallet: https://crates.parity.io/pallet_session/index.html
 * - `Forcing`: https://crates.parity.io/pallet_staking/enum.Forcing.html
 * - `ElectionStatus`: https://crates.parity.io/pallet_staking/enum.ElectionStatus.html
 */
export default class PalletsStakingProgressController extends AbstractController<PalletsStakingProgressService> {
	static controllerName = 'PalletsStakingProgress';
	static requiredPallets = [
		['Babe', 'Staking', 'Session'],
		['ParachainStaking', 'Session'],
	];
	constructor(api: string) {
		super(api, '/pallets/staking/progress', new PalletsStakingProgressService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([['', this.getPalletStakingProgress]]);
	}

	/**
	 * Get the progress of the staking pallet system.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getPalletStakingProgress: RequestHandler = async ({ query: { at, rcAt } }, res): Promise<void> => {
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.derivePalletStakingProgress(hash);

		if (rcBlockNumber) {
			const ahApi = this.api;
			const ahTimestamp = await ahApi.at(hash).then((api) => api.query.timestamp.now());

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsStakingProgressController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsStakingProgressController.sanitizedSend(res, result);
		}
	};
}
