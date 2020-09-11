import { ApiPromise } from '@polkadot/api';
import { DeriveEraExposure } from '@polkadot/api-derive/staking/types';
import { BlockHash } from '@polkadot/types/interfaces';
import {
	EraRewardPoints,
	Perbill,
	StakingLedger,
} from '@polkadot/types/interfaces';
import { CalcPayout } from '@substrate/calc';
import { BadRequest } from 'http-errors';

import {
	IAccountStakingPayouts,
	IEraPayouts,
	IPayout,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';

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

		const [{ number }, historyDepth] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.historyDepth.at(hash),
		]);

		// Information is kept for eras in `[current_era - history_depth; current_era]`
		if (depth > historyDepth.toNumber()) {
			throw new BadRequest(
				'Must specify a depth less than history_depth'
			);
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

		const erasPayouts: (IEraPayouts | { message: string })[] = [];

		// User friendly - we don't error if the user specified era & depth combo <= 0, instead just start at 0
		const startEra = era - (depth - 1) < 0 ? 0 : era - (depth - 1);

		for (let e = startEra; e <= era; e += 1) {
			erasPayouts.push(
				await this.deriveEraPayouts(
					api,
					hash,
					address,
					e,
					unclaimedOnly
				)
			);
		}

		return {
			at,
			erasPayouts,
		};
	}

	/**
	 * Derive all the payouts for `address` at `era`.
	 *
	 * @param api
	 * @param hash `BlockHash` to make call at
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param era the era to query
	 * @param unclaimedOnly whether or not to only show unclaimed payouts
	 */
	async deriveEraPayouts(
		api: ApiPromise,
		hash: BlockHash,
		address: string,
		era: number,
		unclaimedOnly: boolean
	): Promise<IEraPayouts | { message: string }> {
		const eraIndex = api.createType('EraIndex', era);

		const [
			deriveEraExposure,
			eraRewardPoints,
			erasValidatorRewardOption,
		] = await Promise.all([
			api.derive.staking.eraExposure(eraIndex),
			api.query.staking.erasRewardPoints.at(hash, era),
			api.query.staking.erasValidatorReward.at(hash, era),
		]);

		let nominatedExposures = deriveEraExposure.nominators[address];
		if (deriveEraExposure.validators[address]) {
			// We treat an `address` that is a validator as nominating itself
			nominatedExposures = nominatedExposures
				? nominatedExposures.concat({
						validatorId: address,
						validatorIndex: 0,
				  })
				: [
						{
							validatorId: address,
							validatorIndex: 0,
						},
				  ];
		}

		if (!nominatedExposures) {
			return {
				message: `${address} has no nominations for the era ${era}`,
			};
		}

		if (erasValidatorRewardOption.isNone) {
			return {
				message: `No ErasValidatorReward for the era ${era}`,
			};
		}

		// Cache StakingLedger to reduce redundant queries to node
		const validatorLedgerCache: { [id: string]: StakingLedger } = {};

		// Payouts for the era
		const payouts: IPayout[] = [];

		const totalEraRewardPoints = eraRewardPoints.total;
		const totalEraPayout = erasValidatorRewardOption.unwrap();
		const calcPayout = CalcPayout.from_params(
			totalEraRewardPoints.toNumber(),
			totalEraPayout.toString(10)
		);

		// Loop through validators that this nominator backs
		for (const { validatorId } of nominatedExposures) {
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

			const {
				commission: validatorCommission,
				validatorLedger,
			} = await this.fetchCommissionAndLedger(
				api,
				validatorId,
				era,
				hash,
				validatorLedgerCache
			);

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
		api: ApiPromise,
		validatorId: string,
		era: number,
		hash: BlockHash,
		validatorLedgerCache: { [id: string]: StakingLedger }
	): Promise<{
		commission: Perbill;
		validatorLedger?: StakingLedger;
	}> {
		let commission;
		let validatorLedger;
		if (validatorId in validatorLedgerCache) {
			validatorLedger = validatorLedgerCache[validatorId];
			const prefs = await api.query.staking.erasValidatorPrefs(
				era,
				validatorId
			);

			commission = prefs.commission.unwrap();
		} else {
			const [prefs, validatorControllerOption] = await Promise.all([
				api.query.staking.erasValidatorPrefs.at(hash, era, validatorId),
				api.query.staking.bonded.at(hash, validatorId),
			]);

			commission = prefs.commission.unwrap();

			if (validatorControllerOption.isNone) {
				return {
					commission,
				};
			}

			const validatorLedgerOption = await api.query.staking.ledger.at(
				hash,
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
		eraRewardPoints: EraRewardPoints,
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
}
