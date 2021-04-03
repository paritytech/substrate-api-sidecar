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
	ICrowdloansInfoResponse,
	ICrowdloansResponse,
	IEntries,
} from '../../types/responses';
import { IOption, isSome } from '../../types/util';
import { AbstractService } from '../AbstractService';

export type AuctionPhase = 'PreEnding' | 'Ending';

export class ParasService extends AbstractService {
	/**
	 * @param hash
	 * @param paraId
	 * @returns crowdloan information for paradId
	 */
	async crowdloansInfo(
		hash: BlockHash,
		paraId: number
	): Promise<ICrowdloansInfoResponse> {
		const [fund, { number }] = await Promise.all([
			this.api.query.crowdloan.funds.at<Option<FundInfo>>(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
		]);

		if (!fund) {
			throw new InternalServerError(
				`Could not find funds info at para id: ${paraId}`
			);
		}

		let fundInfo, leasePeriods;
		if (fund.isSome) {
			fundInfo = fund.unwrap();
			const firstSlot = fundInfo.firstSlot.toNumber();
			// number of lease periods this crowdloan covers
			const leasePeriodCount = fundInfo.lastSlot.toNumber() - firstSlot + 1;
			leasePeriods = Array(leasePeriodCount)
				.fill(0)
				.map((_, i) => i + firstSlot);
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
			leasePeriods,
		};
	}

	/**
	 * @param hash
	 * @param includeFundInfo
	 * @returns list of all crowdloans
	 */
	async crowdloans(
		hash: BlockHash,
		includeFundInfo: boolean
	): Promise<ICrowdloansResponse> {
		const [{ number }, funds] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.query.crowdloan.funds.entriesAt<Option<FundInfo>>(hash),
		]);

		let entries: IEntries[];
		if (includeFundInfo) {
			entries = funds.map(([keys, fundInfo]) => {
				return {
					paraId: keys.args[0] as ParaId,
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

	async leaseInfo(hash: BlockHash, paraId: number): Promise<any> {
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

			leasesFormatted = leases.map((leaseOpt, idx) => {
				const leasePeriodIndex = currentLeasePeriodIndex + idx;

				if (leaseOpt.isSome) {
					const lease = leaseOpt.unwrap();
					return {
						leasePeriodIndex,
						account: lease[0],
						deposit: lease[1],
					};
				}

				return {
					leasePeriodIndex,
					deposit: null,
					account: null,
				};
			});
		} else {
			leasesFormatted = null;
		}

		let onboardingAs;
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

	async auctionsCurrent(hash: BlockHash): Promise<any> {
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
			phase = beginEnd.gt(blockNumber) ? 'PreEnding' : 'Ending';
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
			leasePeriodIndex,
			beginEnd,
			finishEnd,
			phase,
			auctionIndex: auctionCounter,
			leasePeriods,
			winning,
		};
	}

	async leasesCurrent(
		hash: BlockHash,
		includeCurrentLeaseHolders: boolean
	): Promise<any> {
		let blockNumber, currentLeaseHolders;
		if (!includeCurrentLeaseHolders) {
			const { number } = await this.api.rpc.chain.getHeader(hash);
			blockNumber = number.unwrap();
		} else {
			const [{ number }, leaseEntries] = await Promise.all([
				this.api.rpc.chain.getHeader(hash),
				this.api.query.slots.leases.entriesAt<
					Vec<Option<ITuple<[AccountId, BalanceOf]>>>
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

	async paras(hash: BlockHash): Promise<any> {
		const [{ number }, paraLifecycles] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.query.paras.paraLifecycles.entriesAt<ParaLifecycle>(hash),
		]);

		const parasPromises = paraLifecycles.map(async ([k, paraLifeCycle]) => {
			const paraId = k.args[0];
			let onboardingAs;
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
