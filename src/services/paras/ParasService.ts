import { Option, Vec } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import { AccountId, BalanceOf, BlockHash } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import BN from 'bn.js';

import { IOption, isSome } from '../../types/util';
import { AbstractService } from '../AbstractService';

// TODO moves types to there own file
type AuctionProgress = 'Ongoing' | 'Ending' | 'None';
type WinningDataValue = Option<ITuple<[AccountId, AbstractInt, BalanceOf]>>;
/**
 * [WinningDataValue; 10]
 */
type WiningData = ITuple<
	[
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue,
		WinningDataValue
	]
>;

export class ParasService extends AbstractService {
	async leaseInfo(hash: BlockHash, paraId: number): Promise<any> {
		const [leases, { number }] = await Promise.all([
			this.api.query.slots.leases.at<
				Vec<Option<ITuple<[AccountId, BalanceOf]>>>
			>(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
		]);
		const blockNumber = number.unwrap();

		const at = {
			hash,
			height: blockNumber.toString(10),
		};

		if (!leases.length) {
			return {
				at,
				leases: [],
				message: `Para with ID {paraId} no longer exists or never has existed`,
			};
		}

		const leasePeriod = this.api.consts.slots.leasePeriod as AbstractInt;

		// Caluclate current lease period index
		const currentLeasePeriodIndex = this.currentLeasePeriodIndex(
			blockNumber,
			leasePeriod
		);

		// const leases = leasesTyped.map((leaseOpt, idx) => {
		const leasesFormatted = leases.map((leaseOpt, idx) => {
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
				// TODO: should these be omitted completely or have them as null?
				deposit: null,
				account: null,
			};
		});

		return { at, leases: leasesFormatted };
	}

	async auctionsCurrent(hash: BlockHash): Promise<any> {
		const [auctionInfoOpt, { number }, auctionCounter] = await Promise.all([
			this.api.query.auctions.auctionInfo.at<Option<Vec<AbstractInt>>>(hash),
			this.api.rpc.chain.getHeader(hash),
			this.api.query.auctions.auctionCounter.at<AbstractInt>(hash),
		]);
		const blockNumber = number.unwrap();
		const at = {
			hash,
			height: blockNumber.toString(10),
		};

		const endingPeriod = this.api.consts.auctions.endingPeriod as AbstractInt;

		let leasePeriodIndex: IOption<AbstractInt>,
			beginEnd: IOption<AbstractInt>,
			finishEnd: IOption<BN>,
			progress: IOption<AuctionProgress>,
			winning;
		if (auctionInfoOpt.isSome) {
			[leasePeriodIndex, beginEnd] = auctionInfoOpt.unwrap();
			const endingOffset = this.endingOffset(blockNumber, beginEnd);
			if (endingOffset) {
				winning = await this.api.query.auctions.winning.at<Option<WiningData>>(
					hash,
					endingOffset
				);
			} else {
				winning = null;
			}

			finishEnd = beginEnd.add(endingPeriod);
			progress = beginEnd.gt(blockNumber)
				? 'Ongoing'
				: finishEnd.gt(blockNumber)
				? 'Ending'
				: 'None'; // Not sure if we ever hit this scenario
		} else {
			leasePeriodIndex = null;
			beginEnd = null;
			finishEnd = null;
			progress = null;
			winning = null;
		}

		const leasePeriods =
			leasePeriodIndex instanceof AbstractInt
				? new Array(4)
						.fill(0)
						.map((_, i) => i + (leasePeriodIndex as BN).toNumber())
				: null;

		return {
			at,
			leasePeriodIndex,
			beginEnd,
			finishEnd,
			progress,
			auctionIndex: auctionCounter,
			leasePeriods,
			winning,
		};
	}

	private currentLeasePeriodIndex(blockHeight: BN, leasePeriod: BN): number {
		return blockHeight.div(leasePeriod).toNumber();
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
