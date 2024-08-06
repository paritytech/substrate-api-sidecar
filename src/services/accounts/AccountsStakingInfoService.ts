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
import type { u32, Vec } from '@polkadot/types';
import { BlockHash, StakingLedger, StakingLedgerTo240 } from '@polkadot/types/interfaces';
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

		let nominations = null;
		if (historicApi.query.staking.nominators) {
			const nominationsOption = await historicApi.query.staking.nominators(stash);
			nominations = nominationsOption.unwrapOr(null);
		}

		let claimedRewards: IEraStatus[] = [];

		const depth = Number(api.consts.staking.historyDepth.toNumber());

		const currentEraMaybeOption = await historicApi.query.staking.currentEra();
		if (currentEraMaybeOption.isNone) {
			throw new InternalServerError('CurrentEra is None when Some was expected');
		}
		const currentEra = currentEraMaybeOption.unwrap().toNumber();
		const eraStart = currentEra - depth > 0 ? currentEra - depth : 0;
		let oldCallChecked = false;
		for (let e = eraStart; e < eraStart + depth; e++) {
			let claimedRewardsEras: u32[] = [];

			// Setting as claimed only the era that is defined in the lastReward field
			if ((stakingLedger as unknown as StakingLedgerTo240)?.lastReward) {
				const lastReward = (stakingLedger as unknown as StakingLedgerTo240).lastReward;
				if (lastReward.isSome) {
					const e = (stakingLedger as unknown as StakingLedgerTo240)?.lastReward?.unwrap().toNumber();
					if (e) {
						claimedRewards.push({ era: e, status: 'claimed' });
					}
				}
			} else if (stakingLedger?.legacyClaimedRewards) {
				claimedRewardsEras = stakingLedger?.legacyClaimedRewards;
			} else {
				claimedRewardsEras = (stakingLedger as unknown as StakingLedger)?.claimedRewards as Vec<u32>;
			}
			if (!oldCallChecked) {
				if (claimedRewardsEras.length > 0) {
					claimedRewards = claimedRewardsEras.map((element) => ({
						era: element.toNumber(),
						status: 'claimed',
					}));
					e = claimedRewardsEras[claimedRewardsEras.length - 1].toNumber() + 1;
				}
				oldCallChecked = true;
			}
			if (historicApi.query.staking?.claimedRewards && oldCallChecked) {
				const currentEraMaybeOption = await historicApi.query.staking.currentEra();
				if (currentEraMaybeOption.isNone) {
					throw new InternalServerError('CurrentEra is None when Some was expected');
				}
				const claimedRewardsPerEra = await historicApi.query.staking.claimedRewards(e, stash);
				const erasStakersOverview = await historicApi.query.staking.erasStakersOverview(e, stash);
				let erasStakers = null;
				if (historicApi.query.staking?.erasStakers) {
					erasStakers = await historicApi.query.staking.erasStakers(e, stash);
				}

				const validators = (await historicApi.query.session.validators()).toHuman() as string[];
				const isValidator = validators.includes(stash);
				/**
				 * If the account is a validator, then the rewards from their own stake + commission are claimed
				 * if at least one page of the erasStakersPaged is claimed (it can be any page).
				 * https://github.com/paritytech/polkadot-sdk/blob/776e95748901b50ff2833a7d27ea83fd91fbf9d1/substrate/frame/staking/src/pallet/impls.rs#L357C30-L357C54
				 * code that shows that when `do_payout_stakers_by_page` is called, first the validator is paid out.
				 */
				if (isValidator) {
					if (erasStakersOverview.isSome) {
						const pageCount = erasStakersOverview.unwrap().pageCount.toNumber();
						let nominatorClaimed = false;
						if (claimedRewardsPerEra.length != pageCount) {
							nominatorClaimed = await this.getNominatorClaimed(historicApi, e, stash, pageCount, claimedRewardsPerEra);
						}
						const eraStatus =
							claimedRewardsPerEra.length === 0
								? 'unclaimed'
								: claimedRewardsPerEra.length === pageCount
								  ? 'claimed'
								  : isValidator && claimedRewardsPerEra.length != pageCount
								    ? 'partially claimed'
								    : !isValidator && nominatorClaimed === true
								      ? 'claimed'
								      : !isValidator && nominatorClaimed === false
								        ? 'unclaimed'
								        : 'undefined';
						claimedRewards.push({ era: e, status: eraStatus });
					} else if (erasStakers && erasStakers.total.toBigInt() > 0) {
						// if erasStakers.total > 0, then the pageCount is always 1
						// https://github.com/polkadot-js/api/issues/5859#issuecomment-2077011825
						const eraStatus = claimedRewardsPerEra.length === 1 ? 'claimed' : 'unclaimed';
						claimedRewards.push({ era: e, status: eraStatus });
					}
				} else {
					nominations?.forEach((nomination) => {
						console.log('nomination', nomination);
						// this.getValidatorInfo(historicApi, e, nomination, pageCount, claimedRewardsPerEra);
					});
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

	private async getNominatorClaimed(
		historicApi: ApiDecoration<'promise'>,
		era: number,
		stash: string,
		pageCount: number,
		claimedRewardsPerEra: Vec<u32>,
	): Promise<boolean> {
		for (let i = 0; i < pageCount; i++) {
			const nominatorsRewardsPerPage = await historicApi.query.staking.erasStakersPaged(era, stash, i);
			// const numSlashingSpans = slashingSpansOption.isSome ? slashingSpansOption.unwrap().prior.length + 1 : 0;
			const nominatorFound = nominatorsRewardsPerPage.isSome
				? nominatorsRewardsPerPage.unwrap().others.find((nominator) => nominator.who.toString() === stash)
				: null;
			const claimedEra = claimedRewardsPerEra.find((era) => era === (i as unknown as u32));
			if (nominatorFound && claimedEra) {
				return true;
			}
		}
		return false;
	}

	// private async getValidatorInfo(historicApi: ApiDecoration<'promise'>, stash: string): any {
	// 	const erasStakersOverview = await historicApi.query.staking.erasStakersOverview(e, stash);
	// 	return [erasStakersOverview];
	// }
}
