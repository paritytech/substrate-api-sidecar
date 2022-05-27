// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import {
	DeriveEraExposure,
	DeriveEraExposureNominating,
} from '@polkadot/api-derive/staking/types';
import { Option } from '@polkadot/types';
import {
	BalanceOf,
	BlockHash,
	EraIndex,
	Perbill,
	StakingLedger,
} from '@polkadot/types/interfaces';
import { PalletStakingEraRewardPoints } from '@polkadot/types/lookup';
import { CalcPayout } from '@substrate/calc';
import { BadRequest } from 'http-errors';

import {
	IAccountStakingPayouts,
	IEraPayouts,
	IPayout,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';

/**
 * General information about an era, in tuple form because we initially get it
 * by destructuring a Promise.all(...)
 */
type IErasGeneral = [
	DeriveEraExposure,
	PalletStakingEraRewardPoints,
	Option<BalanceOf>
];

/**
 * Commission and staking ledger of a validator
 */
interface ICommissionAndLedger {
	commission: Perbill;
	validatorLedger?: StakingLedger;
}

/**
 * All the data we need to calculate payouts for an address at a given era.
 */
interface IEraData {
	deriveEraExposure: DeriveEraExposure;
	eraRewardPoints: PalletStakingEraRewardPoints;
	erasValidatorRewardOption: Option<BalanceOf>;
	exposuresWithCommission?: (ICommissionAndLedger & {
		validatorId: string;
	})[];
	eraIndex: EraIndex;
}

export class AccountsStakingPayoutsService extends AbstractService {
	/**
	 * Fetch and derive payouts for `address`.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param depth number of eras to query at and below the specified era
	 * @param era the most recent era to query
	 * @param unclaimedOnly whether or not to only show unclaimed payouts
	 */
	async fetchAccountStakingPayout(
		hash: BlockHash,
		address: string,
		depth: number,
		era: number,
		unclaimedOnly: boolean,
		currentEra: number
	): Promise<IAccountStakingPayouts> {
		const { api } = this;
		const historicApi = await api.at(hash);

		const [{ number }, historyDepth] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.staking.historyDepth(),
		]);

		// Information is kept for eras in `[current_era - history_depth; current_era]`
		if (depth > historyDepth.toNumber()) {
			throw new BadRequest('Must specify a depth less than history_depth');
		}
		if (era - (depth - 1) < currentEra - historyDepth.toNumber()) {
			// In scenarios where depth is not > historyDepth, but the user specifies an era
			// and historyDepth combo that would lead to querying eras older than history depth
			throw new BadRequest(
				'Must specify era and depth such that era - (depth - 1) is less ' +
					'than or equal to current_era - history_depth.'
			);
		}

		const at = {
			height: number.unwrap().toString(10),
			hash,
		};

		// User friendly - we don't error if the user specified era & depth combo <= 0, instead just start at 0
		const startEra = Math.max(0, era - (depth - 1));

		// Fetch general data about the era
		const allErasGeneral = await this.fetchAllErasGeneral(
			api,
			historicApi,
			startEra,
			era
		);

		// With the general data, we can now fetch the commission of each validator `address` nominates
		const allErasCommissions = await this.fetchAllErasCommissions(
			historicApi,
			address,
			startEra,
			// Create an array of `DeriveEraExposure`
			allErasGeneral.map((eraGeneral) => eraGeneral[0])
		).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		// Group together data by Era so we can easily associate parts that are used congruently downstream
		const allEraData = allErasGeneral.map(
			(
				[
					deriveEraExposure,
					eraRewardPoints,
					erasValidatorRewardOption,
				]: IErasGeneral,
				idx: number
			): IEraData => {
				const eraCommissions = allErasCommissions[idx];

				const nominatedExposures = this.deriveNominatedExposures(
					address,
					deriveEraExposure
				);

				// Zip the `validatorId` with its associated `commission`, making the data easier to reason
				// about downstream
				const exposuresWithCommission = nominatedExposures?.map(
					({ validatorId }, idx) => {
						return {
							validatorId,
							...eraCommissions[idx],
						};
					}
				);

				return {
					deriveEraExposure,
					eraRewardPoints,
					erasValidatorRewardOption,
					exposuresWithCommission,
					eraIndex: historicApi.registry.createType('EraIndex', idx + startEra),
				};
			}
		);

		return {
			at,
			erasPayouts: allEraData.map((eraData) =>
				this.deriveEraPayouts(address, unclaimedOnly, eraData)
			),
		};
	}

	/**
	 * Fetch general info about eras in the inclusive range `startEra` .. `era`.
	 *
	 * @param api `ApiPromise`
	 * @param hash `BlockHash` to make call at
	 * @param startEra first era to get data for
	 * @param era the last era to get data for
	 */
	async fetchAllErasGeneral(
		api: ApiPromise,
		historicApi: ApiDecoration<'promise'>,
		startEra: number,
		era: number
	): Promise<IErasGeneral[]> {
		const allDeriveQuerys: Promise<IErasGeneral>[] = [];
		for (let e = startEra; e <= era; e += 1) {
			const eraIndex = historicApi.registry.createType('EraIndex', e);

			const eraGeneralTuple = Promise.all([
				api.derive.staking.eraExposure(eraIndex),
				historicApi.query.staking.erasRewardPoints(eraIndex),
				historicApi.query.staking.erasValidatorReward(eraIndex),
			]);

			allDeriveQuerys.push(eraGeneralTuple);
		}

		return Promise.all(allDeriveQuerys);
	}

	/**
	 * Fetch the commission & staking ledger for each `validatorId` in `deriveErasExposures`.
	 *
	 * @param api `ApiPromise`
	 * @param hash `BlockHash` to make call at
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param startEra first era to get data for
	 * @param deriveErasExposures exposures per era for `address`
	 */
	fetchAllErasCommissions(
		historicApi: ApiDecoration<'promise'>,
		address: string,
		startEra: number,
		deriveErasExposures: DeriveEraExposure[]
	): Promise<ICommissionAndLedger[][]> {
		// Cache StakingLedger to reduce redundant queries to node
		const validatorLedgerCache: { [id: string]: StakingLedger } = {};

		const allErasCommissions = deriveErasExposures.map(
			(deriveEraExposure, idx) => {
				const currEra = idx + startEra;

				const nominatedExposures = this.deriveNominatedExposures(
					address,
					deriveEraExposure
				);

				if (!nominatedExposures) {
					return [];
				}

				const singleEraCommissions = nominatedExposures.map(({ validatorId }) =>
					this.fetchCommissionAndLedger(
						historicApi,
						validatorId,
						currEra,
						validatorLedgerCache
					)
				);

				return Promise.all(singleEraCommissions);
			}
		);

		return Promise.all(allErasCommissions);
	}

	/**
	 * Derive all the payouts for `address` at `era`.
	 *
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param era the era to query
	 * @param eraData data about the address and era we are calculating payouts for
	 */
	deriveEraPayouts(
		address: string,
		unclaimedOnly: boolean,
		{
			deriveEraExposure,
			eraRewardPoints,
			erasValidatorRewardOption,
			exposuresWithCommission,
			eraIndex,
		}: IEraData
	): IEraPayouts | { message: string } {
		if (!exposuresWithCommission) {
			return {
				message: `${address} has no nominations for the era ${eraIndex.toString()}`,
			};
		}

		if (erasValidatorRewardOption.isNone) {
			return {
				message: `No ErasValidatorReward for the era ${eraIndex.toString()}`,
			};
		}

		const totalEraRewardPoints = eraRewardPoints.total;
		const totalEraPayout = erasValidatorRewardOption.unwrap();
		const calcPayout = CalcPayout.from_params(
			totalEraRewardPoints.toNumber(),
			totalEraPayout.toString(10)
		);

		// Iterate through validators that this nominator backs and calculate payouts for the era
		const payouts: IPayout[] = [];
		for (const {
			validatorId,
			commission: validatorCommission,
			validatorLedger,
		} of exposuresWithCommission) {
			const totalValidatorRewardPoints = this.extractTotalValidatorRewardPoints(
				eraRewardPoints,
				validatorId
			);

			if (
				!totalValidatorRewardPoints ||
				totalValidatorRewardPoints?.toNumber() === 0
			) {
				// Nothing to do if there are no reward points for the validator
				continue;
			}

			const { totalExposure, nominatorExposure } = this.extractExposure(
				address,
				validatorId,
				deriveEraExposure
			);

			if (nominatorExposure === undefined) {
				// This should not happen once at this point, but here for safety
				continue;
			}

			if (!validatorLedger) {
				continue;
			}
			// Check if the reward has already been claimed
			const claimed = validatorLedger.claimedRewards.includes(eraIndex);
			if (unclaimedOnly && claimed) {
				continue;
			}

			const nominatorStakingPayout = calcPayout.calc_payout(
				totalValidatorRewardPoints.toNumber(),
				validatorCommission.toNumber(),
				nominatorExposure.unwrap().toString(10),
				totalExposure.unwrap().toString(10),
				address === validatorId
			);

			payouts.push({
				validatorId,
				nominatorStakingPayout,
				claimed,
				totalValidatorRewardPoints,
				validatorCommission,
				totalValidatorExposure: totalExposure.unwrap(),
				nominatorExposure: nominatorExposure.unwrap(),
			});
		}

		return {
			era: eraIndex,
			totalEraRewardPoints,
			totalEraPayout,
			payouts,
		};
	}

	/**
	 * Fetch the `commission` and `StakingLedger` of `validatorId`.
	 *
	 * @param api
	 * @param validatorId accountId of a validator's _Stash_  account
	 * @param era the era to query
	 * @param hash `BlockHash` to make call at
	 * @param validatorLedgerCache object mapping validatorId => StakingLedger to limit redundant queries
	 */
	private async fetchCommissionAndLedger(
		historicApi: ApiDecoration<'promise'>,
		validatorId: string,
		era: number,
		validatorLedgerCache: { [id: string]: StakingLedger }
	): Promise<ICommissionAndLedger> {
		let commission;
		let validatorLedger;
		if (validatorId in validatorLedgerCache) {
			validatorLedger = validatorLedgerCache[validatorId];
			const prefs = await historicApi.query.staking.erasValidatorPrefs(
				era,
				validatorId
			);

			commission = prefs.commission.unwrap();
		} else {
			const [prefs, validatorControllerOption] = await Promise.all([
				historicApi.query.staking.erasValidatorPrefs(era, validatorId),
				historicApi.query.staking.bonded(validatorId),
			]);

			commission = prefs.commission.unwrap();

			if (validatorControllerOption.isNone) {
				return {
					commission,
				};
			}

			const validatorLedgerOption = await historicApi.query.staking.ledger(
				validatorControllerOption.unwrap()
			);

			if (validatorLedgerOption.isNone) {
				return {
					commission,
				};
			}

			validatorLedger = validatorLedgerOption.unwrap();
			validatorLedgerCache[validatorId] = validatorLedger;
		}

		return { commission, validatorLedger };
	}

	/**
	 * Extract the reward points of `validatorId` from `EraRewardPoints`.
	 *
	 * @param eraRewardPoints
	 * @param validatorId accountId of a validator's _Stash_  account
	 * */
	private extractTotalValidatorRewardPoints(
		eraRewardPoints: PalletStakingEraRewardPoints,
		validatorId: string
	) {
		// Ideally we would just use the map's `get`, but that does not seem to be working here
		for (const [id, points] of eraRewardPoints.individual.entries()) {
			if (id.toString() === validatorId) {
				return points;
			}
		}

		return;
	}

	/**
	 * Extract the exposure of `address` and `totalExposure`
	 * from polkadot-js's `deriveEraExposure`.
	 *
	 * @param address address of the _Stash_  account to get the exposure of behind `validatorId`
	 * @param validatorId accountId of a validator's _Stash_  account
	 * @param deriveEraExposure
	 */
	private extractExposure(
		address: string,
		validatorId: string,
		deriveEraExposure: DeriveEraExposure
	) {
		// Get total stake behind validator
		const totalExposure = deriveEraExposure.validators[validatorId].total;

		// Get nominators stake behind validator
		const exposureAllNominators =
			deriveEraExposure.validators[validatorId].others;

		const nominatorExposure =
			address === validatorId // validator is also the nominator we are getting payouts for
				? deriveEraExposure.validators[address].own
				: exposureAllNominators.find(
						(exposure) => exposure.who.toString() === address
				  )?.value;

		return {
			totalExposure,
			nominatorExposure,
		};
	}

	/**
	 * Derive the list of validators nominated by `address`. Note: we count validators as nominating
	 * themself.
	 *
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param deriveEraExposure result of query api.derive.staking.eraExposure(eraIndex)
	 */
	deriveNominatedExposures(
		address: string,
		deriveEraExposure: DeriveEraExposure
	): DeriveEraExposureNominating[] | undefined {
		let nominatedExposures: DeriveEraExposureNominating[] =
			deriveEraExposure.nominators[address] ?? [];
		if (deriveEraExposure.validators[address]) {
			// We treat an `address` that is a validator as nominating itself
			nominatedExposures = nominatedExposures.concat({
				validatorId: address,
				// We put in an arbitrary number because we do not use the index
				validatorIndex: 9999,
			});
		}

		return nominatedExposures;
	}
}
