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
					deposit: lease[1] as AbstractInt,
					account: lease[0] as AccountId,
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
