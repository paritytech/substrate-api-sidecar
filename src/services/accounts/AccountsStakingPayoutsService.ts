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
import type {
	DeriveEraExposure,
	DeriveEraExposureNominating,
	DeriveEraNominatorExposure,
	DeriveEraValidatorExposure,
} from '@polkadot/api-derive/staking/types';
import { Option, StorageKey, u32, u128 } from '@polkadot/types';
import { Vec } from '@polkadot/types';
import type {
	AccountId,
	BalanceOf,
	BlockHash,
	EraIndex,
	EraPoints,
	Perbill,
	StakingLedger,
	StakingLedgerTo240,
	ValidatorPrefsWithCommission,
} from '@polkadot/types/interfaces';
import type {
	PalletStakingEraRewardPoints,
	PalletStakingStakingLedger,
	PalletStakingValidatorPrefs,
	SpStakingExposure,
} from '@polkadot/types/lookup';
import { CalcPayout } from '@substrate/calc';
import { BadRequest } from 'http-errors';

import type { IAccountStakingPayouts, IEraPayouts, IPayout } from '../../types/responses';
import { AbstractService } from '../AbstractService';
import kusamaEarlyErasBlockInfo from './kusamaEarlyErasBlockInfo.json';

/**
 * Copyright 2024 via polkadot-js/api
 * The following code was adopted by https://github.com/polkadot-js/api/blob/3bdf49b0428a62f16b3222b9a31bfefa43c1ca55/packages/api-derive/src/staking/erasExposure.ts.
 */
type KeysAndExposures = [StorageKey<[EraIndex, AccountId]>, SpStakingExposure][];

/**
 * General information about an era, in tuple form because we initially get it
 * by destructuring a Promise.all(...)
 */
type IErasGeneral = [IAdjustedDeriveEraExposure, PalletStakingEraRewardPoints | EraPoints, Option<BalanceOf>];

/**
 * Index of the validator for eras previous to 518 in Kusama chain.
 */
interface ValidatorIndex {
	[x: string]: number;
}
/**
 * Adapted AdjustedDeriveEraExposure interface for compatibility with eras
 * previous to 518 in Kusama chain.
 */
interface IAdjustedDeriveEraExposure extends DeriveEraExposure {
	validatorIndex?: ValidatorIndex;
}

/**
 * Commission and staking ledger of a validator
 */
interface ICommissionAndLedger {
	commission: Perbill;
	validatorLedger?: PalletStakingStakingLedger;
}

/**
 * All the data we need to calculate payouts for an address at a given era.
 */
interface IEraData {
	deriveEraExposure: IAdjustedDeriveEraExposure;
	eraRewardPoints: PalletStakingEraRewardPoints | EraPoints;
	erasValidatorRewardOption: Option<BalanceOf>;
	exposuresWithCommission?: (ICommissionAndLedger & {
		validatorId: string;
	})[];
	eraIndex: EraIndex;
}

/**
 * Block information relevant for compatibility with eras previous
 * to 518 in Kusama chain.
 */
interface IBlockInfo {
	height: string;
	hash: BlockHash;
}

export interface IEarlyErasBlockInfo {
	[era: string]: {
		start: number;
		end: number;
	};
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
	 * @param currentEra The current era
	 * @param historicApi Historic api for querying past blocks
	 */
	async fetchAccountStakingPayout(
		hash: BlockHash,
		address: string,
		depth: number,
		era: number,
		unclaimedOnly: boolean,
		currentEra: number,
		historicApi: ApiDecoration<'promise'>,
	): Promise<IAccountStakingPayouts> {
		const { api } = this;
		const { number } = await api.rpc.chain.getHeader(hash);

		const sanitizedEra = era < 0 ? 0 : era;

		const at: IBlockInfo = {
			height: number.unwrap().toString(10),
			hash,
		};

		// User friendly - we don't error if the user specified era & depth combo <= 0, instead just start at 0
		const startEra = Math.max(0, sanitizedEra - (depth - 1));
		const runtimeInfo = await this.api.rpc.state.getRuntimeVersion(at.hash);
		const isKusama = runtimeInfo.specName.toString().toLowerCase() === 'kusama';

		/**
		 * Given https://github.com/polkadot-js/api/issues/5232,
		 * polkadot-js, and substrate treats historyDepth as a consts. In order
		 * to maintain historical integrity we need to make a check to cover both the
		 * storage query and the consts.
		 */
		let historyDepth: u32 = api.registry.createType('u32', 84);
		if (historicApi.consts.staking.historyDepth) {
			historyDepth = historicApi.consts.staking.historyDepth;
		} else if (historicApi.query.staking.historyDepth) {
			historyDepth = await historicApi.query.staking.historyDepth<u32>();
		} else if (currentEra < 518 && isKusama) {
			historyDepth = api.registry.createType('u32', 0);
		}

		// Information is kept for eras in `[current_era - history_depth; current_era]`
		if (historyDepth.toNumber() !== 0 && depth > historyDepth.toNumber()) {
			throw new BadRequest('Must specify a depth less than history_depth');
		}
		if (era - (depth - 1) < currentEra - historyDepth.toNumber() && historyDepth.toNumber() !== 0) {
			// In scenarios where depth is not > historyDepth, but the user specifies an era
			// and historyDepth combo that would lead to querying eras older than history depth
			throw new BadRequest(
				'Must specify era and depth such that era - (depth - 1) is less ' +
					'than or equal to current_era - history_depth.',
			);
		}

		// Fetch general data about the era
		const allErasGeneral = await this.fetchAllErasGeneral(historicApi, startEra, sanitizedEra, at, isKusama);

		// With the general data, we can now fetch the commission of each validator `address` nominates
		const allErasCommissions = await this.fetchAllErasCommissions(
			historicApi,
			address,
			startEra,
			// Create an array of `DeriveEraExposure`
			allErasGeneral.map((eraGeneral) => eraGeneral[0]),
			isKusama,
		).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		// Group together data by Era so we can easily associate parts that are used congruently downstream
		const allEraData = allErasGeneral.map(
			([deriveEraExposure, eraRewardPoints, erasValidatorRewardOption]: IErasGeneral, idx: number): IEraData => {
				const eraCommissions = allErasCommissions[idx];

				const nominatedExposures = this.deriveNominatedExposures(address, deriveEraExposure);

				// Zip the `validatorId` with its associated `commission`, making the data easier to reason
				// about downstream
				const exposuresWithCommission = nominatedExposures?.map(({ validatorId }, idx) => {
					return {
						validatorId,
						...eraCommissions[idx],
					};
				});

				return {
					deriveEraExposure,
					eraRewardPoints,
					erasValidatorRewardOption,
					exposuresWithCommission,
					eraIndex: historicApi.registry.createType('EraIndex', idx + startEra),
				};
			},
		);

		return {
			at,
			erasPayouts: allEraData.map((eraData) => this.deriveEraPayouts(address, unclaimedOnly, eraData, isKusama)),
		};
	}

	/**
	 * Fetch general info about eras in the inclusive range `startEra` .. `era`.
	 *
	 * @param historicApi Historic api for querying past blocks
	 * @param startEra first era to get data for
	 * @param era the last era to get data for
	 * @param blockNumber block information to ensure compatibility with older eras
	 */
	async fetchAllErasGeneral(
		historicApi: ApiDecoration<'promise'>,
		startEra: number,
		era: number,
		blockNumber: IBlockInfo,
		isKusama: boolean,
	): Promise<IErasGeneral[]> {
		const allDeriveQuerys: Promise<IErasGeneral>[] = [];
		let nextEraStartBlock: number = Number(blockNumber.height);
		let eraDurationInBlocks: number = 0;
		const earlyErasBlockInfo: IEarlyErasBlockInfo = kusamaEarlyErasBlockInfo;
		for (let e = startEra; e <= era; e += 1) {
			const eraIndex = historicApi.registry.createType('EraIndex', e);

			if (historicApi.query.staking.erasRewardPoints) {
				const eraGeneralTuple = Promise.all([
					this.deriveEraExposure(historicApi, eraIndex),
					historicApi.query.staking.erasRewardPoints(eraIndex),
					historicApi.query.staking.erasValidatorReward(eraIndex),
				]);
				allDeriveQuerys.push(eraGeneralTuple);
			} else {
				// We check if we are in the Kusama chain since currently we have
				// the block info for the early eras only for Kusama.
				if (isKusama) {
					// Retrieve the first block of the era following the given era in order
					// to fetch the `Rewards` event at that block.
					nextEraStartBlock = era === 0 ? earlyErasBlockInfo[era + 1].start : earlyErasBlockInfo[era].start;
				} else {
					const sessionDuration = historicApi.consts.staking.sessionsPerEra.toNumber();
					const epochDuration = historicApi.consts.babe.epochDuration.toNumber();
					eraDurationInBlocks = sessionDuration * epochDuration;
				}
				const nextEraStartBlockHash: BlockHash = await this.api.rpc.chain.getBlockHash(nextEraStartBlock);
				const currentEraEndBlockHash: BlockHash =
					era === 0
						? await this.api.rpc.chain.getBlockHash(earlyErasBlockInfo[0].end)
						: await this.api.rpc.chain.getBlockHash(earlyErasBlockInfo[era - 1].end);

				let reward: Option<u128> = historicApi.registry.createType('Option<u128>');

				const blockInfo = await this.api.rpc.chain.getBlock(nextEraStartBlockHash);

				const allRecords = await historicApi.query.system.events();

				blockInfo.block.extrinsics.forEach((index) => {
					allRecords
						.filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
						.forEach(({ event }) => {
							if (event.method.toString() === 'Reward') {
								const [dispatchInfo] = event.data;

								reward = historicApi.registry.createType('Option<u128>', dispatchInfo.toString());
							}
						});
				});
				const points = this.fetchHistoricRewardPoints(currentEraEndBlockHash);
				const rewardPromise: Promise<Option<u128>> = new Promise<Option<u128>>((resolve) => {
					resolve(reward);
				});
				if (!isKusama) {
					nextEraStartBlock = nextEraStartBlock - eraDurationInBlocks;
				}

				const eraGeneralTuple = Promise.all([this.deriveEraExposure(historicApi, eraIndex), points, rewardPromise]);

				allDeriveQuerys.push(eraGeneralTuple);
			}
		}
		return Promise.all(allDeriveQuerys);
	}

	private async fetchHistoricRewardPoints(hash: BlockHash): Promise<EraPoints> {
		const historicApi = await this.api.at(hash);
		return historicApi.query.staking.currentEraPointsEarned() as unknown as EraPoints;
	}

	/**
	 * Fetch the commission & staking ledger for each `validatorId` in `deriveErasExposures`.
	 *
	 * @param historicApi Historic api for querying past blocks
	 * @param address address of the _Stash_  account to get the payouts of
	 * @param startEra first era to get data for
	 * @param deriveErasExposures exposures per era for `address`
	 */
	fetchAllErasCommissions(
		historicApi: ApiDecoration<'promise'>,
		address: string,
		startEra: number,
		deriveErasExposures: IAdjustedDeriveEraExposure[],
		isKusama: boolean,
	): Promise<ICommissionAndLedger[][]> {
		// Cache StakingLedger to reduce redundant queries to node
		const validatorLedgerCache: { [id: string]: PalletStakingStakingLedger } = {};

		const allErasCommissions = deriveErasExposures.map((deriveEraExposure, idx) => {
			const currEra = idx + startEra;

			const nominatedExposures = this.deriveNominatedExposures(address, deriveEraExposure);

			if (!nominatedExposures) {
				return [];
			}

			const singleEraCommissions = nominatedExposures.map(({ validatorId }) =>
				this.fetchCommissionAndLedger(historicApi, validatorId, currEra, validatorLedgerCache, isKusama),
			);

			return Promise.all(singleEraCommissions);
		});

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
		{ deriveEraExposure, eraRewardPoints, erasValidatorRewardOption, exposuresWithCommission, eraIndex }: IEraData,
		isKusama: boolean,
	): IEraPayouts | { message: string } {
		if (!exposuresWithCommission) {
			return {
				message: `${address} has no nominations for the era ${eraIndex.toString()}`,
			};
		}
		if (erasValidatorRewardOption.isNone && eraIndex.toNumber() !== 0) {
			const event = eraIndex.toNumber() > 517 ? 'ErasValidatorReward' : 'Reward';
			return {
				message: `No ${event} for the era ${eraIndex.toString()}`,
			};
		}

		const totalEraRewardPoints = eraRewardPoints.total;
		const totalEraPayout =
			eraIndex.toNumber() !== 0 ? erasValidatorRewardOption.unwrap() : this.api.registry.createType('BalanceOf', 0);
		const calcPayout = CalcPayout.from_params(totalEraRewardPoints.toNumber(), totalEraPayout.toString(10));

		// Iterate through validators that this nominator backs and calculate payouts for the era
		const payouts: IPayout[] = [];
		for (const { validatorId, commission: validatorCommission, validatorLedger } of exposuresWithCommission) {
			const totalValidatorRewardPoints = deriveEraExposure.validatorIndex
				? this.extractTotalValidatorRewardPoints(eraRewardPoints, validatorId, deriveEraExposure.validatorIndex)
				: this.extractTotalValidatorRewardPoints(eraRewardPoints, validatorId);
			if (!totalValidatorRewardPoints || totalValidatorRewardPoints?.toNumber() === 0) {
				// Nothing to do if there are no reward points for the validator
				continue;
			}

			const { totalExposure, nominatorExposure } = this.extractExposure(address, validatorId, deriveEraExposure);

			if (nominatorExposure === undefined) {
				// This should not happen once at this point, but here for safety
				continue;
			}
			if (!validatorLedger) {
				continue;
			}

			/**
			 * Check if the reward has already been claimed.
			 *
			 * It is important to note that the following examines types that are both current and historic.
			 * When going back far enough in certain chains types such as `StakingLedgerTo240` are necessary for grabbing
			 * any reward data.
			 */
			let indexOfEra: number;
			if (validatorLedger.legacyClaimedRewards) {
				indexOfEra = validatorLedger.legacyClaimedRewards.indexOf(eraIndex);
			} else if ((validatorLedger as unknown as StakingLedger).claimedRewards) {
				indexOfEra = (validatorLedger as unknown as StakingLedger).claimedRewards.indexOf(eraIndex);
			} else if ((validatorLedger as unknown as StakingLedgerTo240).lastReward) {
				const lastReward = (validatorLedger as unknown as StakingLedgerTo240).lastReward;
				if (lastReward.isSome) {
					indexOfEra = (validatorLedger as unknown as StakingLedgerTo240).lastReward.unwrap().toNumber();
				} else {
					continue;
				}
			} else if (eraIndex.toNumber() < 518 && isKusama) {
				indexOfEra = eraIndex.toNumber();
			} else {
				continue;
			}
			const claimed: boolean = Number.isInteger(indexOfEra) && indexOfEra !== -1;
			if (unclaimedOnly && claimed) {
				continue;
			}

			const nominatorStakingPayout = calcPayout.calc_payout(
				totalValidatorRewardPoints.toNumber(),
				validatorCommission.toNumber(),
				nominatorExposure.unwrap().toString(10),
				totalExposure.unwrap().toString(10),
				address === validatorId,
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
	 * @param historicApi Historic api for querying past blocks
	 * @param validatorId accountId of a validator's _Stash_  account
	 * @param era the era to query
	 * @param validatorLedgerCache object mapping validatorId => StakingLedger to limit redundant queries
	 */
	private async fetchCommissionAndLedger(
		historicApi: ApiDecoration<'promise'>,
		validatorId: string,
		era: number,
		validatorLedgerCache: { [id: string]: PalletStakingStakingLedger },
		isKusama: boolean,
	): Promise<ICommissionAndLedger> {
		let commission: Perbill;
		let validatorLedger;
		let commissionPromise;
		const ancient: boolean = era < 518;
		if (validatorId in validatorLedgerCache) {
			validatorLedger = validatorLedgerCache[validatorId];
			let prefs: PalletStakingValidatorPrefs | ValidatorPrefsWithCommission;
			if (!ancient) {
				prefs = await historicApi.query.staking.erasValidatorPrefs(era, validatorId);
				commission = prefs.commission.unwrap();
			} else {
				prefs = (await historicApi.query.staking.validators(validatorId)) as ValidatorPrefsWithCommission;
				commission = (prefs[0] as PalletStakingValidatorPrefs | ValidatorPrefsWithCommission).commission.unwrap();
			}
		} else {
			commissionPromise =
				ancient && isKusama
					? historicApi.query.staking.validators(validatorId)
					: historicApi.query.staking.erasValidatorPrefs(era, validatorId);

			const [prefs, validatorControllerOption] = await Promise.all([
				commissionPromise,
				historicApi.query.staking.bonded(validatorId),
			]);

			commission =
				ancient && isKusama
					? (prefs[0] as PalletStakingValidatorPrefs | ValidatorPrefsWithCommission).commission.unwrap()
					: prefs.commission.unwrap();

			if (validatorControllerOption.isNone) {
				return {
					commission,
				};
			}

			const validatorLedgerOption = await historicApi.query.staking.ledger(validatorControllerOption.unwrap());
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
	 * Copyright 2024 via polkadot-js/api
	 * The following code was adopted by https://github.com/polkadot-js/api/blob/3bdf49b0428a62f16b3222b9a31bfefa43c1ca55/packages/api-derive/src/staking/erasExposure.ts.
	 *
	 * The original version uses the base ApiDerive implementation which does not include the ApiDecoration implementation.
	 * It is required in this version to query older blocks for their historic data.
	 *
	 * @param historicApi Historic api for querying past blocks
	 * @param eraIndex index of the era to query
	 */
	private async deriveEraExposure(
		historicApi: ApiDecoration<'promise'>,
		eraIndex: EraIndex,
	): Promise<IAdjustedDeriveEraExposure> {
		function mapStakers(
			era: EraIndex,
			stakers: KeysAndExposures,
			validatorIndex: ValidatorIndex,
		): IAdjustedDeriveEraExposure {
			const nominators: DeriveEraNominatorExposure = {};
			const validators: DeriveEraValidatorExposure = {};

			stakers.forEach(([key, exposure]): void => {
				const validatorId = key.args[1].toString();

				validators[validatorId] = exposure;

				exposure.others.forEach(({ who }, validatorIndex): void => {
					const nominatorId = who.toString();

					nominators[nominatorId] = nominators[nominatorId] || [];
					nominators[nominatorId].push({ validatorId, validatorIndex });
				});
			});
			if (Object.keys(validatorIndex).length > 0) {
				return { era, nominators, validators, validatorIndex };
			} else {
				return { era, nominators, validators };
			}
		}
		let storageKeys: KeysAndExposures = [];

		const validatorIndex: ValidatorIndex = {};

		if (historicApi.query.staking.erasStakersClipped) {
			storageKeys = await historicApi.query.staking.erasStakersClipped.entries(eraIndex);
		} else {
			const validators: Vec<AccountId> = (await historicApi.query.staking.currentElected()) as Vec<AccountId>;

			const validatorId: AccountId[] = [];

			validators.map((validator, index) => {
				validatorIndex[validator.toString()] = index;
				validatorId.push(validator);
			});

			let eraExposure: SpStakingExposure = {} as SpStakingExposure;

			for (const validator of validatorId) {
				const storageKey = {
					args: [eraIndex, validator],
				} as unknown as StorageKey<[EraIndex, AccountId]>;
				eraExposure = (await historicApi.query.staking.stakers(validator)) as unknown as SpStakingExposure;
				storageKeys.push([storageKey, eraExposure]);
			}
		}

		return mapStakers(eraIndex, storageKeys, validatorIndex);
	}
	/**
	 * Extract the reward points of `validatorId` from `EraRewardPoints`.
	 *
	 * @param eraRewardPoints
	 * @param validatorId accountId of a validator's _Stash_  account
	 * @param validatorIndex index of the validator in relation to the `EraPoints`
	 * array
	 * */
	private extractTotalValidatorRewardPoints(
		eraRewardPoints: PalletStakingEraRewardPoints | EraPoints,
		validatorId: string,
		validatorIndex?: ValidatorIndex,
	) {
		// Ideally we would just use the map's `get`, but that does not seem to be working here
		if (validatorIndex === undefined) {
			for (const [id, points] of eraRewardPoints.individual.entries()) {
				if (id.toString() === validatorId) {
					return points;
				}
			}
		} else {
			for (const [id, points] of eraRewardPoints.individual.entries()) {
				if (id.toString() === validatorIndex[validatorId.toString()].toString()) {
					return points;
				}
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
	 * @param deriveEraExposure result of deriveEraExposure
	 */
	private extractExposure(address: string, validatorId: string, deriveEraExposure: IAdjustedDeriveEraExposure) {
		// Get total stake behind validator
		const totalExposure = deriveEraExposure.validators[validatorId].total;

		// Get nominators stake behind validator
		const exposureAllNominators = deriveEraExposure.validators[validatorId].others;

		const nominatorExposure =
			address === validatorId // validator is also the nominator we are getting payouts for
				? deriveEraExposure.validators[address].own
				: exposureAllNominators.find((exposure) => exposure.who.toString() === address)?.value;

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
	 * @param deriveEraExposure result of deriveEraExposure
	 */
	deriveNominatedExposures(
		address: string,
		deriveEraExposure: IAdjustedDeriveEraExposure,
	): DeriveEraExposureNominating[] | undefined {
		let nominatedExposures: DeriveEraExposureNominating[] = deriveEraExposure.nominators[address] ?? [];
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
