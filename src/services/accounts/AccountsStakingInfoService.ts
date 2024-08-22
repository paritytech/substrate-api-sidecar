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

import type { ApiDecoration } from '@polkadot/api/types';
import { Option, u32, Vec } from '@polkadot/types';
import { BlockHash, StakingLedger, StakingLedgerTo240 } from '@polkadot/types/interfaces';
import type { SpStakingExposure, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import { BadRequest, InternalServerError } from 'http-errors';
import { IAccountStakingInfo, IEraStatus } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsStakingInfoService extends AbstractService {
	/**
	 * Fetch staking information for a _Stash_ account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param stash address of the _Stash_  account to get the staking info of
	 */
	async fetchAccountStakingInfo(hash: BlockHash, stash: string): Promise<IAccountStakingInfo> {
		const { api } = this;
		const historicApi = await api.at(hash);

		const [header, controllerOption] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.staking.bonded(stash), // Option<AccountId> representing the controller
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(stash, err);
		});

		const at = {
			hash,
			height: header.number.unwrap().toString(10),
		};

		if (controllerOption.isNone) {
			throw new BadRequest(`The address ${stash} is not a stash address.`);
		}

		const controller = controllerOption.unwrap();

		const [stakingLedgerOption, rewardDestination, slashingSpansOption] = await Promise.all([
			historicApi.query.staking.ledger(controller),
			historicApi.query.staking.payee(stash),
			historicApi.query.staking.slashingSpans(stash),
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(stash, err);
		});

		const stakingLedger = stakingLedgerOption.unwrapOr(null);

		if (stakingLedger === null) {
			// should never throw because by time we get here we know we have a bonded pair
			throw new InternalServerError(
				`Staking ledger could not be found for controller address "${controller.toString()}"`,
			);
		}
		let isValidator = false;
		if (historicApi.query.session) {
			const validators = (await historicApi.query.session.validators()).toHuman() as string[];
			isValidator = validators.includes(stash);
		}

		let nominations = null;
		if (historicApi.query.staking.nominators) {
			const nominationsOption = await historicApi.query.staking.nominators(stash);
			nominations = nominationsOption.unwrapOr(null);
		}

		// Checking if rewards were claimed for each era
		let claimedRewards: IEraStatus[] = [];
		// Defining for which range of eras to check if rewards were claimed
		const depth = Number(api.consts.staking.historyDepth.toNumber());
		const currentEraMaybeOption = await historicApi.query.staking.currentEra();
		if (currentEraMaybeOption.isNone) {
			throw new InternalServerError('CurrentEra is None when Some was expected');
		}
		const currentEra = currentEraMaybeOption.unwrap().toNumber();
		const eraStart = currentEra - depth > 0 ? currentEra - depth : 0;
		let oldCallChecked = false;
		// Checking each era one by one
		for (let e = eraStart; e < eraStart + depth; e++) {
			let claimedRewardsEras: u32[] = [];

			// Checking first the old call of `lastReward` and setting as claimed only the era that
			// is defined in the lastReward field. I do not make any assumptions for any other eras.
			if ((stakingLedger as unknown as StakingLedgerTo240)?.lastReward) {
				const lastReward = (stakingLedger as unknown as StakingLedgerTo240).lastReward;
				if (lastReward.isSome) {
					const e = (stakingLedger as unknown as StakingLedgerTo240)?.lastReward?.unwrap().toNumber();
					if (e) {
						claimedRewards.push({ era: e, status: 'claimed' });
					}
				}
				// Second check is another old call called `legacyClaimedRewards` from stakingLedger
			} else if (stakingLedger?.legacyClaimedRewards) {
				claimedRewardsEras = stakingLedger?.legacyClaimedRewards;
				// If none of the above are present, we try the `claimedRewards` from stakingLedger
			} else {
				claimedRewardsEras = (stakingLedger as unknown as StakingLedger)?.claimedRewards as Vec<u32>;
			}
			/**
			 * Here we check if we already checked/used the info from the old calls. If not we will use them and
			 * populate the claimedRewards array with the eras that are claimed. The data from the old calls
			 * can also be empty (no results) and claimedRewards array will be populated with the data only from
			 * the new call `query.staking?.claimedRewards` further below.
			 */
			if (!oldCallChecked) {
				if (claimedRewardsEras.length > 0) {
					claimedRewards = claimedRewardsEras.map((element) => ({
						era: element.toNumber(),
						status: 'claimed',
					}));
					const claimedRewardsErasMax = claimedRewardsEras[claimedRewardsEras.length - 1].toNumber();
					/**
					 * Added this check because from old calls sometimes I would get other eras than the ones I am checking.
					 * In that case, I need to check if the era is in the range I am checking.
					 */
					if (eraStart <= claimedRewardsErasMax) {
						e = claimedRewardsErasMax + 1;
					} else {
						claimedRewards = [];
					}
				}
				oldCallChecked = true;
			}
			/**
			 *  If the old calls are checked (which means `oldCallChecked` flag is true) and the new call
			 * `query.staking.claimedRewards` is available then we go into this check.
			 */
			if (historicApi.query.staking?.claimedRewards && oldCallChecked) {
				const currentEraMaybeOption = await historicApi.query.staking.currentEra();
				if (currentEraMaybeOption.isNone) {
					throw new InternalServerError('CurrentEra is None when Some was expected');
				}
				// Populating `claimedRewardsPerEra` for validator
				const claimedRewardsPerEra: Vec<u32> = await historicApi.query.staking.claimedRewards(e, stash);

				if (isValidator) {
					claimedRewards = await this.fetchErasStatusForValidator(
						historicApi,
						e,
						stash,
						claimedRewardsPerEra,
						claimedRewards,
					);
				} else {
					// Call function for Nominator
				}
			} else {
				break;
			}
		}
		const numSlashingSpans = slashingSpansOption.isSome ? slashingSpansOption.unwrap().prior.length + 1 : 0;

		return {
			at,
			controller,
			rewardDestination,
			numSlashingSpans,
			nominations,
			staking: {
				stash: stakingLedger.stash,
				total: stakingLedger.total,
				active: stakingLedger.active,
				unlocking: stakingLedger.unlocking,
				claimedRewards: claimedRewards,
			},
		};
	}

	private async fetchErasStatusForValidator(
		historicApi: ApiDecoration<'promise'>,
		e: number,
		stash: string,
		claimedRewardsPerEra: Vec<u32>,
		claimedRewards: IEraStatus[],
	): Promise<IEraStatus[]> {
		const erasStakersOverview: Option<SpStakingPagedExposureMetadata> =
			await historicApi.query.staking.erasStakersOverview(e, stash);
		let erasStakers: SpStakingExposure | null = null;
		if (historicApi.query.staking?.erasStakers) {
			erasStakers = await historicApi.query.staking.erasStakers(e, stash);
		}

		if (erasStakersOverview.isSome) {
			const pageCount = erasStakersOverview.unwrap().pageCount.toNumber();
			const eraStatus =
				claimedRewardsPerEra.length === 0
					? 'unclaimed'
					: claimedRewardsPerEra.length === pageCount
					  ? 'claimed'
					  : claimedRewardsPerEra.length != pageCount
					    ? 'partially claimed'
					    : 'undefined';
			claimedRewards.push({ era: e, status: eraStatus });
		} else if (erasStakers && erasStakers.total.toBigInt() > 0) {
			// if erasStakers.total > 0, then the pageCount is always 1
			// https://github.com/polkadot-js/api/issues/5859#issuecomment-2077011825
			const eraStatus = claimedRewardsPerEra.length === 1 ? 'claimed' : 'unclaimed';
			claimedRewards.push({ era: e, status: eraStatus });
		}
		return claimedRewards;
	}
}
