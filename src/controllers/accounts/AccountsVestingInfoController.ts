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
import { IAddressParam } from 'src/types/requests';

import { validateAddress, validateRcAt } from '../../middleware';
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
 * - (Optional)`rcAt`: Relay chain block at which to retrieve Asset Hub data. Only supported
 * 		for Asset Hub endpoints. Cannot be used with 'at' parameter.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `vesting`: Vesting schedule for an account.
 *   - `locked`: Number of tokens locked at start.
 *   - `perBlock`: Number of tokens that gets unlocked every block after `startingBlock`.
 *   - `startingBlock`: Starting block for unlocking(vesting).
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `rcAt` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `rcAt` parameter is used.
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
		this.router.use(this.path, validateAddress, validateRcAt);

		this.safeMountAsyncGetHandlers([['', this.getAccountVestingInfo]]);
	}

	/**
	 * Get vesting information for an account.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountVestingInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at, rcAt } },
		res,
	): Promise<void> => {
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.fetchAccountVestingInfo(hash, address);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			AccountsVestingInfoController.sanitizedSend(res, enhancedResult);
		} else {
			AccountsVestingInfoController.sanitizedSend(res, result);
		}
	};
}
