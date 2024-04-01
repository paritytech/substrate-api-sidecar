// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import { Option, u32 } from '@polkadot/types';
import BN from 'bn.js';
import { RequestHandler } from 'express';
import { BadRequest, InternalServerError } from 'http-errors';

import { validateAddress, validateBoolean } from '../../middleware';
import { AccountsStakingPayoutsService } from '../../services';
import { IEarlyErasBlockInfo } from '../../services/accounts/AccountsStakingPayoutsService';
import kusamaEarlyErasBlockInfo from '../../services/accounts/kusamaEarlyErasBlockInfo.json';
import { IAddressParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * GET payout information for a stash account.
 *
 * Path params:
 * - `address`: SS58 address of the account. Must be a _Stash_ account.
 *
 * Query params:
 * - (Optional) `depth`: The number of eras to query for payouts of. Must be less
 * 	than `HISTORY_DEPTH`. In cases where `era - (depth -1)` is less
 *	than 0, the first era queried will be 0. Defaults to 1.
 * - (Optional) `era`: The era to query at. Max era payout info is available for
 * 	 is the latest finished era: `active_era - 1`. Defaults to `active_era - 1`.
 * - (Optional) `unclaimedOnly`: Only return unclaimed rewards. Defaults to true.
 *
 * Returns:
 * - `at`:
 * 	- `hash`: The block's hash.
 * 	- `height`: The block's height.
 * - `eraPayouts`: array of
 * 	- `era`: Era this information is associated with.
 * 	- `totalEraRewardPoints`: Total reward points for the era.
 * 	- `totalEraPayout`: Total payout for the era. Validators split the payout
 * 			based on the portion of `totalEraRewardPoints` they have.
 * 	- `payouts`: array of
 * 		- `validatorId`: AccountId of the validator the payout is coming from.
 * 		- `nominatorStakingPayout`: Payout for the reward destination associated with the
 * 			accountId the query was made for.
 * 		- `claimed`: Whether or not the reward has been claimed.
 * 		- `totalValidatorRewardPoints`: Number of reward points earned by the validator.
 * 		- `validatorCommission`: The percentage of the total payout that the validator
 * 				takes as commission, expressed as a Perbill.
 * 		- `totalValidatorExposure`: The sum of the validator's and its nominators' stake.
 * 		- `nominatorExposure`: The amount of stake the nominator has behind the validator.
 *
 * Description:
 * Returns payout information for the last specified eras. If specifying both
 * the depth and era query params, this endpoint will return information for
 * (era - depth) through era. (i.e. if depth=5 and era=20 information will be
 * returned for eras 16 through 20). N.B. You cannot query eras less then
 * `current_era - HISTORY_DEPTH`.
 *
 * N.B. The `nominator*` fields correspond to the address being queried, even if it
 * is a validator's _stash_ address. This is because a validator is technically
 * nominating itself.
 *
 * `payouts` Is an array of payouts for a nominating stash address and information
 * about the validator they were nominating. `eraPayouts` contains an array of
 * objects that has staking reward metadata for each era, and an array of the
 * aformentioned payouts.
 *
 */
export default class AccountsStakingPayoutsController extends AbstractController<AccountsStakingPayoutsService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/staking-payouts', new AccountsStakingPayoutsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateBoolean(['unclaimedOnly']));

		this.safeMountAsyncGetHandlers([['', this.getStakingPayoutsByAccountId]]);
	}

	/**
	 * Get the payouts of `address` for `depth` starting from the `era`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getStakingPayoutsByAccountId: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { depth, era, unclaimedOnly, at } },
		res,
	): Promise<void> => {
		const earlyErasBlockInfo: IEarlyErasBlockInfo = kusamaEarlyErasBlockInfo;
		let hash = await this.getHashFromAt(at);
		let apiAt = await this.api.at(hash);
		const runtimeInfo = await this.api.rpc.state.getRuntimeVersion(hash);
		const isKusama = runtimeInfo.specName.toString().toLowerCase() === 'kusama';
		const { eraArg, currentEra } = await this.getEraAndHash(apiAt, this.verifyAndCastOr('era', era, undefined));
		if (currentEra <= 519 && depth !== undefined && isKusama) {
			throw new InternalServerError('The `depth` query parameter is disabled for eras less than 518.');
		} else if (currentEra <= 519 && era !== undefined && isKusama) {
			throw new InternalServerError('The `era` query parameter is disabled for eras less than 518.');
		}
		let sanitizedDepth: string | undefined;
		if (depth && isKusama) {
			sanitizedDepth = Math.min(Number(depth), currentEra - 518).toString();
		} else if (depth) {
			sanitizedDepth = depth as string;
		}
		if (currentEra < 518 && isKusama) {
			const eraStartBlock: number = earlyErasBlockInfo[currentEra].start;
			hash = await this.getHashFromAt(eraStartBlock.toString());
			apiAt = await this.api.at(hash);
		}

		const unclaimedOnlyArg = unclaimedOnly === 'false' ? false : true;

		AccountsStakingPayoutsController.sanitizedSend(
			res,
			await this.service.fetchAccountStakingPayout(
				hash,
				address,
				this.verifyAndCastOr('depth', sanitizedDepth, 1) as number,
				eraArg,
				unclaimedOnlyArg,
				currentEra,
				apiAt,
			),
		);
	};

	private async getEraAndHash(apiAt: ApiDecoration<'promise'>, era?: number) {
		let currentEra: number;
		const currentEraMaybeOption = (await apiAt.query.staking.currentEra()) as u32 & Option<u32>;
		if (currentEraMaybeOption instanceof Option) {
			if (currentEraMaybeOption.isNone) {
				throw new InternalServerError('CurrentEra is None when Some was expected');
			}

			currentEra = currentEraMaybeOption.unwrap().toNumber();
		} else if ((currentEraMaybeOption as unknown) instanceof BN) {
			// EraIndex extends u32, which extends BN so this should always be true
			currentEra = (currentEraMaybeOption as BN).toNumber();
		} else {
			throw new InternalServerError('Query for current_era returned a non-processable result.');
		}

		let activeEra;
		if (apiAt.query.staking.activeEra) {
			const activeEraOption = await apiAt.query.staking.activeEra();
			if (activeEraOption.isNone) {
				const historicActiveEra = await apiAt.query.staking.currentEra();
				if (historicActiveEra.isNone) {
					throw new InternalServerError('ActiveEra is None when Some was expected');
				} else {
					activeEra = historicActiveEra.unwrap().toNumber();
				}
			} else {
				activeEra = activeEraOption.unwrap().index.toNumber();
			}
		} else {
			const sessionIndex = await apiAt.query.session.currentIndex();
			const idx = sessionIndex.toNumber() % 6;
			// https://substrate.stackexchange.com/a/2026/1786
			if (currentEra < 518) {
				activeEra = currentEra;
			} else if (idx > 0) {
				activeEra = currentEra;
			} else {
				activeEra = currentEra - 1;
			}
		}

		if (era !== undefined && era > activeEra - 1) {
			throw new BadRequest(
				`The specified era (${era}) is too large. ` + `Largest era payout info is available for is ${activeEra - 1}`,
			);
		}

		return {
			eraArg: era === undefined ? activeEra - 1 : era,
			currentEra,
		};
	}
}
