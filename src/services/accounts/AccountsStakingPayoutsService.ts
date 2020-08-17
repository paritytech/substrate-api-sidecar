import { ApiPromise } from '@polkadot/api';
import { DeriveEraExposure } from '@polkadot/api-derive/staking/types';
import { Compact } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import {
	EraRewardPoints,
	Perbill,
	StakingLedger,
} from '@polkadot/types/interfaces';
import { Big } from 'big.js';
import * as BN from 'bn.js';
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
		unclaimedOnly: boolean
	): Promise<IAccountStakingPayouts> {
		const api = await this.ensureMeta(hash);

		const [{ number }, historyDepth] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.historyDepth.at(hash),
		]);

		if (depth > historyDepth.toNumber()) {
			throw new BadRequest(
				'Must specify a depth less than or equal to history depth'
			);
		}

		const at = {
			height: number.unwrap().toString(10),
			hash,
		};

		const erasPayouts: (IEraPayouts | { message: string })[] = [];

		// TODO alternatively could throw an error when an invalid depth is specified
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
	 * Derive all the payouts for `address` for `era`.
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

		if (deriveEraExposure.validators[address]) {
			// We treat an `address` that is a validator as nominating itself
			deriveEraExposure.nominators[address] = deriveEraExposure
				.nominators[address]
				? deriveEraExposure.nominators[address].concat({
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

		const nominatedExposures = deriveEraExposure.nominators[address];

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
		const eraPayout = erasValidatorRewardOption.unwrap();

		const totalEraRewardPoints = eraRewardPoints.total;

		// Cache StakingLedger to reduce redundant queries to node.
		const validatorLedgerCache: { [id: string]: StakingLedger } = {};

		// Payouts for the era
		const payouts: IPayout[] = [];

		// Loop through validators that this nominator backs
		for (const { validatorId } of nominatedExposures) {
			const validatorRewardPoints = this.extractValidatorRewardPoints(
				eraRewardPoints,
				validatorId
			);

			if (
				!validatorRewardPoints ||
				validatorRewardPoints?.toNumber() === 0
			) {
				// Nothing to do if their are no reward points for validator
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

			// This is the fraction of the total reward that the validator and the
			// nominators will get.
			const validatorTotalRewardPart = new Big(
				validatorRewardPoints.toString(10)
			).div(new Big(totalEraRewardPoints.toString(10)));

			// This is how much validator + nominators are entitled to.
			const validatorTotalPayout = new Big(validatorTotalRewardPart).mul(
				new Big(eraPayout.toString(10))
			);

			const {
				commission,
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

			// Get the validators commission as a decimal so we can multiply it as a percent
			// Commission is a PerBill (per billion)
			const commissionDecimal = new Big(
				commission.unwrap().toString(10)
			).div(new Big(1_000_000_000));

			// Calculate validators cut off the top
			const validatorCommissionPayout = commissionDecimal.mul(
				validatorTotalPayout
			);
			// This is whats left after subtracting commission
			const validatorLeftoverPayout = validatorTotalPayout.sub(
				validatorCommissionPayout
			);

			// Calculate the payout for `address`
			const nominatorExposurePart = new Big(
				nominatorExposure.unwrap().toString(10)
			).div(new Big(totalExposure.unwrap().toString(10)));
			const nominatorLeftoverPayout = nominatorExposurePart.mul(
				validatorLeftoverPayout
			);
			// Add commission if address is validator
			const nominatorPayoutEstimate =
				address === validatorId
					? nominatorLeftoverPayout.add(validatorCommissionPayout)
					: nominatorLeftoverPayout;

			payouts.push({
				validatorId,
				nominatorPayoutEstimate,
				validatorTotalPayoutEstimate: validatorTotalPayout, // TODO change names
				claimed,
				validatorRewardPoints: new BN(validatorRewardPoints).toString(
					10
				),
				validatorCommission: commissionDecimal,
				totalValidatorExposure: totalExposure.unwrap(),
				nominatorExposure: nominatorExposure.unwrap(),
			});
		}

		return {
			era: eraIndex,
			totalEraRewardPoints,
			payouts,
		};
	}

	/**
	 * Fetch the `commission` and `StakingLedger` of `validatorId`.
	 *
	 * @param api
	 * @param validatorId accountId of the validator's _Stash_  account
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
		commission: Compact<Perbill>;
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

			commission = prefs.commission;
		} else {
			const [prefs, validatorControllerOption] = await Promise.all([
				api.query.staking.erasValidatorPrefs.at(hash, era, validatorId),
				api.query.staking.bonded.at(hash, validatorId),
			]);

			commission = prefs.commission;

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
	 * @param validatorId accountId of the validator's _Stash_  account
	 * */
	private extractValidatorRewardPoints(
		eraRewardPoints: EraRewardPoints,
		validatorId: string
	) {
		// Ideally we would just use the map's `get`, but since AccountId is an object we can't
		for (const [id, points] of eraRewardPoints.individual.entries()) {
			if (id.toString() === validatorId) {
				return points;
			}
		}

		return;
	}

	/**
	 * Extract the exposure of `address` and `validatorId`
	 * from polkadot-js's `deriveEraExposure`.
	 *
	 * @param address address of the _Stash_  account to get the exposure of behind `validatorId`
	 * @param validatorId accountId of the validator's _Stash_  account
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

		if (nominatorExposure === undefined) {
			return { totalExposure };
		}

		return {
			totalExposure,
			nominatorExposure,
		};
	}
}
