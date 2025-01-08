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
import { AccountId32, BlockHash, StakingLedger, StakingLedgerTo240 } from '@polkadot/types/interfaces';
import type {
	PalletStakingRewardDestination,
	PalletStakingSlashingSlashingSpans,
	PalletStakingStakingLedger,
	SpStakingExposure,
	SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { BadRequest, InternalServerError } from 'http-errors';
import { IAccountStakingInfo, IEraStatus, NominatorStatus, ValidatorStatus } from 'src/types/responses';

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

		// Fetching initial data
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
		const [stakingLedgerOption, rewardDestination, slashingSpansOption] = await this.fetchStakingData(
			historicApi,
			controller,
			stash,
		);
		const stakingLedger = stakingLedgerOption.unwrapOr(null);

		// Checking if the account is a validator
		let isValidator = false;
		if (historicApi.query.session) {
			const validators = (await historicApi.query.session.validators()).toHuman() as string[];
			isValidator = validators.includes(stash);
		}

		if (stakingLedger === null) {
			// should never throw because by time we get here we know we have a bonded pair
			throw new InternalServerError(
				`Staking ledger could not be found for controller address "${controller.toString()}"`,
			);
		}

		// Fetching the list of validators that a nominator is nominating. This is only relevant for nominators.
		// The stash account that we use as key is the nominator's stash account.
		// https://polkadot.js.org/docs/substrate/storage/#nominatorsaccountid32-optionpalletstakingnominations
		const nominations = historicApi.query.staking.nominators
			? (await historicApi.query.staking.nominators(stash)).unwrapOr(null)
			: null;

		// Initializing two arrays to store the status of claimed rewards per era for validators and for nominators.
		let claimedRewards: IEraStatus<ValidatorStatus | NominatorStatus>[] = [];
		let claimedRewardsNom: IEraStatus<NominatorStatus>[] = [];

		const [eraStart, depth] = await this.fetchErasInfo(api, historicApi);

		let oldCallChecked = false;
		// Checking each era one by one
		for (let e = eraStart; e < eraStart + depth; e++) {
			let claimedRewardsEras: u32[] = [];

			[claimedRewardsEras, claimedRewards] = this.fetchClaimedInfoFromOldCalls(
				stakingLedger,
				claimedRewardsEras,
				claimedRewards,
			);

			[oldCallChecked, claimedRewards, e] = this.isOldCallsChecked(
				oldCallChecked,
				claimedRewardsEras,
				claimedRewards,
				eraStart,
				depth,
				e,
			);
			claimedRewardsNom = claimedRewards as IEraStatus<NominatorStatus>[];
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
					// If the account is a Nominator, then to determine if an era is claimed or not, I need to check
					// if the era of one of their Validators is claimed or not.
					const nominatingValidators = await historicApi.query.staking.nominators(stash);
					const validatorsUnwrapped = nominatingValidators.unwrap().targets.toHuman() as string[];

					const [era, claimedRewardsNom1] = await this.fetchErasStatusForNominator(
						historicApi,
						e,
						depth,
						eraStart,
						claimedRewardsNom,
						validatorsUnwrapped,
						stash,
					);
					e = era;
					claimedRewardsNom = claimedRewardsNom1;
				}
			} else {
				break;
			}
		}
		if (!isValidator) {
			claimedRewards = claimedRewardsNom;
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
				claimedRewards: isValidator ? claimedRewards : claimedRewardsNom,
			},
		};
	}

	private async fetchStakingData(
		historicApi: ApiDecoration<'promise'>,
		controller: AccountId32,
		stash: string,
	): Promise<
		[
			Option<PalletStakingStakingLedger>,
			Option<PalletStakingRewardDestination>,
			Option<PalletStakingSlashingSlashingSpans>,
		]
	> {
		const [stakingLedgerOption, rewardDestination, slashingSpansOption] = await Promise.all([
			historicApi.query.staking.ledger(controller) as unknown as Option<PalletStakingStakingLedger>,
			historicApi.query.staking.payee(stash),
			historicApi.query.staking.slashingSpans(stash),
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(stash, err);
		});
		return [stakingLedgerOption, rewardDestination, slashingSpansOption];
	}

	private async fetchErasStatusForValidator(
		historicApi: ApiDecoration<'promise'>,
		e: number,
		stash: string,
		claimedRewardsPerEra: Vec<u32>,
		claimedRewards: IEraStatus<ValidatorStatus>[],
	): Promise<IEraStatus<ValidatorStatus>[]> {
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

	private async fetchErasStatusForNominator(
		historicApi: ApiDecoration<'promise'>,
		e: number,
		depth: number,
		eraStart: number,
		claimedRewardsNom: IEraStatus<NominatorStatus>[],
		validatorsUnwrapped: string[],
		nominatorStash: string,
	): Promise<[number, IEraStatus<NominatorStatus>[]]> {
		// Iterate through all validators that the nominator is nominating and
		// check if the rewards are claimed or not.
		for (const [idx, validatorStash] of validatorsUnwrapped.entries()) {
			let oldCallChecked = false;
			if (claimedRewardsNom.length == 0) {
				const [era, claimedRewardsOld, oldCallCheck] = await this.fetchErasFromOldCalls(
					historicApi,
					e,
					depth,
					eraStart,
					claimedRewardsNom,
					validatorStash,
					oldCallChecked,
				);
				claimedRewardsNom = claimedRewardsOld;
				oldCallChecked = oldCallCheck;
				e = era;
			} else {
				oldCallChecked = true;
			}

			// Checking if the new call is available then I can check if rewards of nominator are claimed or not.
			// If not available, I will set the status to 'undefined'.
			if (historicApi.query.staking?.claimedRewards && oldCallChecked) {
				const currentEraMaybeOption = await historicApi.query.staking.currentEra();
				if (currentEraMaybeOption.isNone) {
					throw new InternalServerError('CurrentEra is None when Some was expected');
				}
				// Populating `claimedRewardsPerEra` for validator
				const claimedRewardsPerEra: Vec<u32> = await historicApi.query.staking.claimedRewards(e, validatorStash);

				// Doing similar checks as in fetchErasStatusForValidator function
				// but with slight changes to adjust to nominator's case
				const erasStakersOverview: Option<SpStakingPagedExposureMetadata> =
					await historicApi.query.staking.erasStakersOverview(e, validatorStash);
				let erasStakers: SpStakingExposure | null = null;
				if (historicApi.query.staking?.erasStakers) {
					erasStakers = await historicApi.query.staking.erasStakers(e, validatorStash);
				}

				if (erasStakersOverview.isSome) {
					const pageCount = erasStakersOverview.unwrap().pageCount.toNumber();
					const eraStatus: NominatorStatus =
						claimedRewardsPerEra.length === 0
							? 'unclaimed'
							: claimedRewardsPerEra.length === pageCount
								? 'claimed'
								: claimedRewardsPerEra.length != pageCount
									? await this.ErasStatusNominatorForValPartiallyClaimed(
											historicApi,
											e,
											validatorStash,
											pageCount,
											nominatorStash,
											claimedRewardsPerEra,
										)
									: 'undefined';
					claimedRewardsNom.push({ era: e, status: eraStatus });
					break;
				} else if (erasStakers && erasStakers.total.toBigInt() > 0) {
					// if erasStakers.total > 0, then the pageCount is always 1
					// https://github.com/polkadot-js/api/issues/5859#issuecomment-2077011825
					const eraStatus = claimedRewardsPerEra.length === 1 ? 'claimed' : 'unclaimed';
					claimedRewardsNom.push({ era: e, status: eraStatus });
					break;
				} else {
					if (idx === validatorsUnwrapped.length - 1) {
						claimedRewardsNom.push({ era: e, status: 'undefined' });
					} else {
						continue;
					}
				}
			}
		}
		return [e, claimedRewardsNom];
	}

	/**
	 * This function takes a specific stash account and gives back the era and status of the rewards for that era.
	 */
	private async fetchErasFromOldCalls(
		historicApi: ApiDecoration<'promise'>,
		e: number,
		depth: number,
		eraStart: number,
		claimedRewards: IEraStatus<NominatorStatus>[],
		validatorStash: string,
		oldCallChecked: boolean,
	): Promise<[number, IEraStatus<NominatorStatus>[], boolean]> {
		let claimedRewardsEras: u32[] = [];
		const controllerOption = await historicApi.query.staking.bonded(validatorStash);

		if (controllerOption.isNone) {
			return [e, claimedRewards, oldCallChecked];
		}

		const controller = controllerOption.unwrap();
		const [stakingLedgerOption, ,] = await this.fetchStakingData(historicApi, controller, validatorStash);
		const stakingLedgerValNom = stakingLedgerOption.unwrapOr(null);

		[claimedRewardsEras, claimedRewards] = this.fetchClaimedInfoFromOldCalls(
			stakingLedgerValNom,
			claimedRewardsEras,
			claimedRewards,
		) as [u32[], IEraStatus<NominatorStatus>[]];

		[oldCallChecked, claimedRewards, e] = this.isOldCallsChecked(
			oldCallChecked,
			claimedRewardsEras,
			claimedRewards,
			eraStart,
			depth,
			e,
		) as [boolean, IEraStatus<NominatorStatus>[], number];

		return [e, claimedRewards, oldCallChecked];
	}

	private async ErasStatusNominatorForValPartiallyClaimed(
		historicApi: ApiDecoration<'promise'>,
		e: number,
		validatorStash: string,
		pageCount: number,
		nominatorStash: string,
		claimedRewardsPerEra: Vec<u32>,
	): Promise<NominatorStatus> {
		// If era is partially claimed from the side of the validator that means that the validator
		// has more than one page of nominators. In this case, I need to check in which page the nominator is
		// and if that page was claimed or not.
		for (let page = 0; page < pageCount; page++) {
			if (historicApi.query.staking?.erasStakersPaged) {
				const erasStakers = await historicApi.query.staking.erasStakersPaged(e, validatorStash, page);
				const erasStakersPaged = erasStakers.unwrapOr(null);
				if (erasStakersPaged?.others) {
					for (const nominator of erasStakersPaged.others.entries()) {
						if (nominatorStash === nominator[1].who.toString()) {
							if (claimedRewardsPerEra.length > 0) {
								const pageIncluded = claimedRewardsPerEra?.some((reward) => Number(reward) === Number(page));
								if (pageIncluded) {
									return 'claimed';
								} else {
									return 'unclaimed';
								}
							}
							break;
						}
					}
				}
			}
		}
		return 'undefined';
	}

	/**
	 * This function retrieves the eras information (eraStart and depth),
	 * which defines the range of eras to check if rewards were claimed or not.
	 */
	private async fetchErasInfo(api: ApiDecoration<'promise'>, historicApi: ApiDecoration<'promise'>) {
		const depth = Number(api.consts.staking.historyDepth.toNumber());
		const currentEraMaybeOption = await historicApi.query.staking.currentEra();
		if (currentEraMaybeOption.isNone) {
			throw new InternalServerError('CurrentEra is None when Some was expected');
		}
		const currentEra = currentEraMaybeOption.unwrap().toNumber();
		const eraStart = currentEra - depth > 0 ? currentEra - depth : 0;
		return [eraStart, depth];
	}

	/**
	 * This function verifies if the information from old calls has already been checked/used. If not,
	 * it proceeds to use it and populate the `claimedRewards` array with the eras that have been claimed.
	 * Note that data from old calls may also be empty (no results), in which case the `claimedRewards` array
	 * will only be populated with data from the new `query.staking?.claimedRewards` call
	 * (later in the main function's code).
	 *
	 * Returns a boolean flag `oldCallChecked` that indicates if the old calls have already been checked/used or not.
	 *
	 */
	private isOldCallsChecked(
		oldCallChecked: boolean,
		claimedRewardsEras: u32[],
		claimedRewards: IEraStatus<ValidatorStatus | NominatorStatus>[],
		eraStart: number,
		depth: number,
		e: number,
	): [boolean, IEraStatus<ValidatorStatus | NominatorStatus>[], number] {
		if (!oldCallChecked) {
			if (claimedRewardsEras.length > 0) {
				claimedRewards = claimedRewardsEras.map((element) => ({
					era: element.toNumber(),
					status: 'claimed',
				}));
				const claimedRewardsErasMax = claimedRewardsEras[claimedRewardsEras.length - 1].toNumber();
				/**
				 * This check was added because old calls would sometimes return eras outside the intended range.
				 * In such cases, I need to verify if the era falls within the specific range I am checking.
				 */
				if (eraStart <= claimedRewardsErasMax) {
					e = claimedRewardsErasMax + 1;
				} else if (depth == claimedRewardsEras.length) {
					if (claimedRewardsEras[0].toNumber() == eraStart) {
						e = eraStart + depth;
					}
				} else {
					claimedRewards = [];
				}
			}
			oldCallChecked = true;
		}
		return [oldCallChecked, claimedRewards, e];
	}

	private fetchClaimedInfoFromOldCalls(
		stakingLedger: PalletStakingStakingLedger | null,
		claimedRewardsEras: u32[],
		claimedRewards: IEraStatus<ValidatorStatus | NominatorStatus>[],
	): [u32[], IEraStatus<ValidatorStatus | NominatorStatus>[]] {
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
		return [claimedRewardsEras, claimedRewards];
	}
}
