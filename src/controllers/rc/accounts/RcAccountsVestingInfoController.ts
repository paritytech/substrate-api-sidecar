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
import { IAddressParam } from 'src/types/requests';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { validateAddress } from '../../../middleware';
import { AccountsVestingInfoService } from '../../../services';
import AbstractController from '../../AbstractController';

/**
 * GET vesting information for an address on the relay chain.
 *
 * Paths:
 * - `address`: Address to query.
 *
 * Query params:
 * - (Optional)`at`: Block at which to retrieve vesting information at. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `vesting`: Array of vesting schedules for an account.
 *   - `locked`: Number of tokens locked at start.
 *   - `perBlock`: Number of tokens that gets unlocked every block after `startingBlock`.
 *   - `startingBlock`: Starting block for unlocking(vesting).
 *   - `unlockable`: Amount that has vested and can be unlocked at the queried block.
 * - `totalUnlockable`: Total amount that can be unlocked across all vesting schedules.
 * - `blockNumberForCalculation`: The block number used for calculating unlockable amounts.
 * - `blockNumberSource`: Indicates which chain's block number was used ('relay' or 'self').
 *
 * Note: For relay chain pre-migration queries, unlockable is calculated using the relay
 * chain's own block number. Post-migration, vesting has moved to Asset Hub.
 *
 * Substrate Reference:
 * - Vesting Pallet: https://crates.parity.io/pallet_vesting/index.html
 * - `VestingInfo`: https://crates.parity.io/pallet_vesting/struct.VestingInfo.html
 */
export default class RcAccountsVestingInfoController extends AbstractController<AccountsVestingInfoService> {
	static controllerName = 'RcAccountsVestingInfo';
	static requiredPallets = [['Vesting'], ['CalamariVesting']];

	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/accounts/:address/vesting-info', new AccountsVestingInfoService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([['', this.getAccountVestingInfo]]);
	}

	/**
	 * Get vesting information for an account on the relay chain.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountVestingInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const result = await this.service.fetchAccountVestingInfo(hash, address);

		RcAccountsVestingInfoController.sanitizedSend(res, result);
	};
}
