import { Option, Vec } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	BalanceOf,
	BlockHash,
	FundInfo,
	ParaGenesisArgs,
	ParaId,
	ParaLifecycle,
	WinningData,
} from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import {
	AuctionPhase,
	IAuctionsCurrent,
	ICrowdloans,
	ICrowdloansInfo,
	IFund,
	ILeaseInfo,
	ILeasesCurrent,
	IParas,
	LeaseFormatted,
	ParaType,
} from '../../types/responses';
import { IOption, isSome } from '../../types/util';
import { AbstractService } from '../AbstractService';

export class ParasService extends AbstractService {
	/**
	 * @param hash `BlockHash` to make call at
	 * @param paraId ID of para to get crowdloan info for
	 * @returns crowdloan information for paradId
	 */
	async crowdloansInfo(
		hash: BlockHash,
		paraId: number
	): Promise<ICrowdloansInfo> {
		const [fund, { number }] = await Promise.all([
			this.api.query.crowdloan.funds.at<Option<FundInfo>>(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
		]);

		if (!fund) {
			throw new InternalServerError(
				`Could not find funds info at para id: ${paraId}`
			);
		}

		let fundInfo, leasePeriods, retirementEnd;
		if (fund.isSome) {
			fundInfo = fund.unwrap();
			const firstSlot = fundInfo.firstSlot.toNumber();
			// number of lease periods this crowdloan covers
			const leasePeriodCount = fundInfo.lastSlot.toNumber() - firstSlot + 1;
			leasePeriods = Array(leasePeriodCount)
				.fill(0)
				.map((_, i) => i + firstSlot);
			retirementEnd = fundInfo.end.add(
				this.api.consts.crowdloan.retirementPeriod as AbstractInt
			);
		} else {
			fundInfo = null;
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			fundInfo,
			// TOOD would it make snese to merge the below derived info into `fundInfo`
			// or put them under another key like `fundInfoDerive`?
			leasePeriods,
			retirementEnd,
		};
	}

	/**
	 * @param hash `BlockHash` to make call at
	 * @param includeFundInfo wether or not to include `FundInfo` for every crowdloan
	 * @returns list of all crowdloans
	 */
	async crowdloans(
		hash: BlockHash,
		includeFundInfo: boolean
	): Promise<ICrowdloans> {
		const [{ number }, funds] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.query.crowdloan.funds.entriesAt<Option<FundInfo>, [ParaId]>(
				hash
			),
		]);

		let entries: IFund[];
		if (includeFundInfo) {
			entries = funds.map(([keys, fundInfo]) => {
				return {
					paraId: keys.args[0],
					fundInfo,
				};
			});
		} else {
			entries = (await this.api.query.crowdloan.funds.keys<[ParaId]>()).map(
				({ args: [paraId] }) => {
					return {
						paraId,
					};
				}
			);
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			funds: entries,
		};
	}

	/**
	 * @param hash `BlockHash` to make call at
	 * @param paraId ID of para to get lease info of
	 * @returns current and future lease info as well as lifecycle information for
	 * a given `paraId`
	 */
	async leaseInfo(hash: BlockHash, paraId: number): Promise<ILeaseInfo> {
		const [leases, { number }, paraLifeCycle] = await Promise.all([
			this.api.query.slots.leases.at<
				Vec<Option<ITuple<[AccountId, BalanceOf]>>>
			>(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
			this.api.query.paras.paraLifecycles.at<ParaLifecycle>(hash, paraId),
		]);
		const blockNumber = number.unwrap();

		const at = {
			hash,
			height: blockNumber.toString(10),
		};

		let leasesFormatted;
		if (leases.length) {
			const currentLeasePeriodIndex = this.currentLeasePeriodIndex(
				blockNumber
			).toNumber();

			leasesFormatted = leases.reduce((acc, curLeaseOpt, idx) => {
				if (curLeaseOpt.isSome) {
					const leasePeriodIndex = currentLeasePeriodIndex + idx;
					const lease = curLeaseOpt.unwrap();
					acc.push({
						leasePeriodIndex,
						account: lease[0],
						deposit: lease[1],
					});
				}

				return acc;
			}, [] as LeaseFormatted[]);
		} else {
			leasesFormatted = null;
		}

		let onboardingAs: ParaType | undefined;
		if (paraLifeCycle.isOnboarding) {
			const paraGenesisArgs = await this.api.query.paras.paraGenesisArgs.at<ParaGenesisArgs>(
				hash,
				paraId
			);
			onboardingAs = paraGenesisArgs.parachain.isTrue
				? 'parachain'
				: 'parathread';
		}

		return {
			at,
			paraLifeCycle,
			onboardingAs,
			leases: leasesFormatted,
		};
	}

	/**
	 * @param hash `BlockHash` to make call at
	 * @returns information on the current auction. Most fields will be null if
	 * if there is no ongoing auction.
	 */
	async auctionsCurrent(hash: BlockHash): Promise<IAuctionsCurrent> {
		const [auctionInfoOpt, { number }, auctionCounter] = await Promise.all([
			this.api.query.auctions.auctionInfo.at<Option<Vec<AbstractInt>>>(hash),
			this.api.rpc.chain.getHeader(hash),
			this.api.query.auctions.auctionCounter.at<AbstractInt>(hash),
		]);
		const blockNumber = number.unwrap();

		const endingPeriod = this.api.consts.auctions.endingPeriod as AbstractInt;

		let leasePeriodIndex: IOption<AbstractInt>,
			beginEnd: IOption<AbstractInt>,
			finishEnd: IOption<BN>,
			phase: IOption<AuctionPhase>,
			winning;
		if (auctionInfoOpt.isSome) {
			[leasePeriodIndex, beginEnd] = auctionInfoOpt.unwrap();
			const endingOffset = this.endingOffset(blockNumber, beginEnd);
			if (endingOffset) {
				winning = await this.api.query.auctions.winning.at<Option<WinningData>>(
					hash,
					endingOffset
				);
			} else {
				winning = null;
			}

			finishEnd = beginEnd.add(endingPeriod);
			phase = beginEnd.gt(blockNumber) ? 'preEnding' : 'ending';
		} else {
			leasePeriodIndex = null;
			beginEnd = null;
			finishEnd = null;
			phase = null;
			winning = null;
		}

		const leasePeriods = isSome(leasePeriodIndex)
			? Array(4)
					.fill(0)
					.map((_, i) => i + (leasePeriodIndex as BN).toNumber())
			: null;

		return {
			at: {
				hash,
				height: blockNumber.toString(10),
			},
			beginEnd,
			finishEnd,
			phase,
			// If there is no current auction, this will be the index of the previous auction
			auctionIndex: auctionCounter,
			leasePeriods,
			winning,
		};
	}

	/**
	 * @param hash `BlockHash` to make call at
	 * @param includeCurrentLeaseHolders wether or not to include the paraIds of
	 * all the curent lease holders. Not including is likely faster and reduces
	 * response size.
	 * @returns general information about the current lease period
	 */
	async leasesCurrent(
		hash: BlockHash,
		includeCurrentLeaseHolders: boolean
	): Promise<ILeasesCurrent> {
		let blockNumber, currentLeaseHolders;
		if (!includeCurrentLeaseHolders) {
			const { number } = await this.api.rpc.chain.getHeader(hash);
			blockNumber = number.unwrap();
		} else {
			const [{ number }, leaseEntries] = await Promise.all([
				this.api.rpc.chain.getHeader(hash),
				this.api.query.slots.leases.entriesAt<
					Vec<Option<ITuple<[AccountId, BalanceOf]>>>,
					[ParaId]
				>(hash),
			]);

			blockNumber = number.unwrap();

			currentLeaseHolders = leaseEntries
				.filter(([_k, leases]) => leases[0].isSome)
				.map(([key, _l]) => key.args[0]);
		}

		const leasePeriod = this.api.consts.slots.leasePeriod as AbstractInt;
		const leasePeriodIndex = this.currentLeasePeriodIndex(blockNumber);
		const endOfLeasePeriod = leasePeriodIndex.mul(leasePeriod).add(leasePeriod);

		return {
			at: {
				hash,
				height: blockNumber.toString(10),
			},
			leasePeriodIndex,
			endOfLeasePeriod,
			currentLeaseHolders,
		};
	}

	/**
	 * @param hash `BlockHash` to make call at
	 * @returns all the current registered paraIds and their lifecycle status
	 */
	async paras(hash: BlockHash): Promise<IParas> {
		const [{ number }, paraLifecycles] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.query.paras.paraLifecycles.entriesAt<ParaLifecycle, [ParaId]>(
				hash
			),
		]);

		const parasPromises = paraLifecycles.map(async ([k, paraLifeCycle]) => {
			const paraId = k.args[0];
			let onboardingAs: ParaType | undefined;
			if (paraLifeCycle.isOnboarding) {
				const paraGenesisArgs = await this.api.query.paras.paraGenesisArgs.at<ParaGenesisArgs>(
					hash,
					paraId
				);
				onboardingAs = paraGenesisArgs.parachain.isTrue
					? 'parachain'
					: 'parathread';
			}

			return {
				paraId,
				paraLifeCycle,
				onboardingAs,
			};
		});

		return {
			at: {
				hash,
				height: number.unwrap().toString(10),
			},
			paras: await Promise.all(parasPromises),
		};
	}

	/**
	 * Calculate the current lease period index.
	 *
	 * @param blockHeight current blockheight
	 * @param leasePeriod duration of lease period
	 * @returns current lease period index
	 */
	private currentLeasePeriodIndex(now: BN): BN {
		const leasePeriod = this.api.consts.slots.leasePeriod as AbstractInt;
		return now.div(leasePeriod);
	}

	/**
	 * The offset into the ending samples of the auction.
	 *
	 * Mimics `Auctioneer::is_ending` impl in polkadot's `runtime::common::auctions`.
	 *
	 * @param now current block number
	 * @param startEnd block number of the start of the auctions ending period
	 * @returns offset or null
	 */
	private endingOffset(
		now: AbstractInt,
		begginEnd: IOption<AbstractInt>
	): IOption<BN> {
		if (!isSome(begginEnd)) {
			return null;
		}

		const afterEarlyEnd = now.sub(begginEnd);
		if (afterEarlyEnd.lten(0)) {
			return null;
		}

		const sampleLength = this.api.consts.auctions.sampleLength as AbstractInt;
		return afterEarlyEnd.div(sampleLength);
	}
}
