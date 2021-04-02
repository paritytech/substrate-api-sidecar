import { Option, Tuple, Vec } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	BlockHash,
	FundInfo,
	ParaId,
} from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import { IAt } from '../../types/responses';
import { AbstractService } from '../AbstractService';

/**
 * Wrote the types up here for now just for development, will move to
 * types directory when this is wrapped up
 */
interface IEntries {
	paraId: number;
	fundInfo: Option<FundInfo> | {};
}

interface ICrowdloansInfoResponse {
	at: IAt;
	fundInfo: Option<FundInfo>;
}

interface ICrowdloansResponse {
	at: IAt;
	funds: IEntries[];
}

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

	/**
	 * @param hash
	 * @param paraId
	 * @returns
	 * {
	 *   "at": {},
	 *   "paraId": number,
	 *   "fundInfo": {...}
	 * }
	 */
	async crowdloansInfo(
		hash: BlockHash,
		paraId: number
	): Promise<ICrowdloansInfoResponse> {
		const [funds, { number }] = await Promise.all([
			this.api.query.crowdloan.funds.at(hash, paraId),
			this.api.rpc.chain.getHeader(hash),
		]);

		if (!funds) {
			throw new InternalServerError(
				`Could not find funds info at parathread id: ${paraId}`
			);
		}

		const fundInfo = funds as Option<FundInfo>;

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			fundInfo,
		};
	}

	/**
	 * @param hash
	 * @param includeFundInfo
	 * @returns
	 * {
	 *   "at": {}
	 *   "funds": [
	 *     {
	 *       "paraId": number,
	 *       "fundInfo": {}
	 *     }
	 *   ]
	 * }
	 */
	async crowdloans(
		hash: BlockHash,
		includeFundInfo: boolean
	): Promise<ICrowdloansResponse> {
		const { number } = await this.api.rpc.chain.getHeader(hash);

		/**
		 * @TODO
		 * see if we want to filter any items.
		 */
		const entries: IEntries[] = (
			await this.api.query.crowdloan.funds.entries()
		).map((k) => {
			const paraId = (k[0].args[0] as ParaId).toNumber();
			const funds: Option<FundInfo> | {} = includeFundInfo
				? k[1] as Option<FundInfo>
				: {};

			return {
				paraId,
				fundInfo: funds,
			};
		});

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			funds: entries,
		};
	}

	private currentLeasePeriodIndex(blockHeight: BN, leasePeriod: BN): number {
		return blockHeight.div(leasePeriod).toNumber();
	}
}
