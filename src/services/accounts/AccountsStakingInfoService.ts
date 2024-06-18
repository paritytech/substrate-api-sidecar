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

import type { u32, Vec } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';
import { IAccountStakingInfo, IEraStatus, IStakingLedger } from 'src/types/responses';

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
		let claimedRewardsEras: u32[] = [];
		let claimedRewards: IEraStatus[] = [];
		if (stakingLedger?.legacyClaimedRewards) {
			claimedRewardsEras = stakingLedger?.legacyClaimedRewards;
		} else {
			claimedRewardsEras = (stakingLedger as unknown as IStakingLedger)?.claimedRewards as Vec<u32>;
		}
		claimedRewards = claimedRewardsEras.map((element) => ({
			era: element.toNumber(),
			status: 'claimed',
		}));
		if (historicApi.query.staking?.claimedRewards) {
			const currentEraMaybeOption = await historicApi.query.staking.currentEra();
			const currentEra = currentEraMaybeOption.unwrap().toNumber();

			let depth = Number(api.consts.staking.historyDepth.toNumber());
			let eraStart = currentEra - depth;
			if (claimedRewards.length > 0) {
				depth = depth - claimedRewards.length;
				eraStart = claimedRewards[claimedRewards.length - 1].era + 1;
			}

			for (let e = eraStart; e < eraStart + depth; e++) {
				const claimedRewardsPerEra = await historicApi.query.staking.claimedRewards(e, stash);
				const erasStakersOverview = await historicApi.query.staking.erasStakersOverview(e, stash);
				let erasStakers = null;
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
							  : 'partially claimed';
					claimedRewards.push({ era: e, status: eraStatus });
				} else if (erasStakers && erasStakers.total.toBigInt() > 0) {
					// if erasStakers.total > 0, then the pageCount is always 1
					// https://github.com/polkadot-js/api/issues/5859#issuecomment-2077011825
					const eraStatus = claimedRewardsPerEra.length === 1 ? 'claimed' : 'unclaimed';
					claimedRewards.push({ era: e, status: eraStatus });
				}
			}
		}

		const numSlashingSpans = slashingSpansOption.isSome ? slashingSpansOption.unwrap().prior.length + 1 : 0;

		return {
			at,
			controller,
			rewardDestination,
			numSlashingSpans,
			staking: {
				stash: stakingLedger.stash,
				total: stakingLedger.total,
				active: stakingLedger.active,
				unlocking: stakingLedger.unlocking,
				claimedRewards: claimedRewards,
			},
		};
	}
}
