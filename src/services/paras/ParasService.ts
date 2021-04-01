import { Option, Tuple, Vec } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import { AccountId, BlockHash } from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { AbstractService } from '../AbstractService';

export class ParasService extends AbstractService {
	async leaseInfo(hash: BlockHash, paraId: number): Promise<any> {
		const [leasesAt, { number }] = await Promise.all([
			this.api.query.slots.leases.at(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
		]);
		const leasesTyped = leasesAt as Vec<Option<Tuple>>;
		const blockNumber = number.unwrap();
		const at = {
			hash,
			height: blockNumber.toString(10),
		};

		if (!leasesTyped.length) {
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

		const leases = leasesTyped.map((leaseOpt, idx) => {
			const leasePeriodIndex = currentLeasePeriodIndex + idx;

			if (leaseOpt.isSome) {
				const lease = leaseOpt.unwrap();
				return {
					leasePeriodIndex,
					account: lease[0] as AccountId,
					deposit: lease[1] as AbstractInt,
				};
			}

			return {
				leasePeriodIndex,
				// TODO: should these be omitted completely or have them as null?
				deposit: null,
				account: null,
			};
		});

		return { at, leases };
	}

	async auctionsCurrent(hash: BlockHash): Promise<any> {
		const [auctionInfoOpt, { number }, auctionCounter] = await Promise.all([
			this.api.query.auctions.auctionInfo.at(hash),
			this.api.rpc.chain.getHeader(hash),
			this.api.query.auctions.auctionCounter.at(hash),
		]);
		const winningOpt = await this.api.query.auctions.winning.at(
			hash,
			number.toNumber() - 1
		);
		const auctionInfoOptTyped = auctionInfoOpt as Option<Vec<AbstractInt>>;
		const auctionCounterTyped = auctionCounter as AbstractInt;
		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		const endingPeriod = this.api.consts.auctions.endingPeriod as AbstractInt;

		let leasePeriodIndex: null | AbstractInt,
			beginEnd,
			finishEnd,
			progress,
			winning;
		if (auctionInfoOptTyped.isSome) {
			[leasePeriodIndex, beginEnd] = auctionInfoOptTyped.unwrap();
			finishEnd = beginEnd.add(endingPeriod);
			progress = beginEnd.gt(number.unwrap())
				? 'Ongoing'
				: finishEnd.gt(number.unwrap())
				? 'Ending'
				: 'None'; // Not sure if we ever hit this scenario
			winning = (winningOpt as Option<any>).isSome // not sure if this query is working
				? (winningOpt as Option<any>).unwrap()
				: null;
		} else {
			leasePeriodIndex = null;
			beginEnd = null;
			finishEnd = null;
			progress = null;
			winning = null;
		}

		const leasePeriods = leasePeriodIndex
			? new Array(4)
					.fill(0)
					.map((_, i) => i + (leasePeriodIndex as AbstractInt).toNumber())
			: null;

		return {
			at,
			leasePeriodIndex,
			beginEnd,
			finishEnd,
			progress,
			auctionIndex: auctionCounterTyped,
			leasePeriods,
			winning,
		};
	}

	// NOTE can delete this when you fork
	// async crowdLoanInfo(hash: BlockHash, paraId: number): Promise<any> {
	// 	const [fundInfo, { number }] = await Promise.all([
	// 		this.api.query.crowdloan.fundInfo.at(hash, paraId),
	// 		this.api.rpc.chain.getHeader(hash),
	// 	]);

	// 	const at = {
	// 		hash,
	// 		height: number.unwrap().toString(10),
	// 	};

	// 	return {
	// 		at,
	// 		fundInfo,
	// 	};
	// }

	private currentLeasePeriodIndex(blockHeight: BN, leasePeriod: BN): number {
		return blockHeight.div(leasePeriod).toNumber();
	}
}
