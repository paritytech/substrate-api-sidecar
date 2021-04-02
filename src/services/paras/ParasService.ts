import { Option, Tuple, Vec } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	BlockHash,
	FundInfo,
	ParaId,
} from '@polkadot/types/interfaces';
import { AnyJson } from '@polkadot/types/types';
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
	fundInfo: IFundInfo | {};
}

interface ICrowdloansInfoResponse {
	at: IAt;
	fundInfo: IFundInfo;
}

interface ICrowdloansResponse {
	at: IAt;
	funds: IEntries[];
}

interface IFundInfo {
	retiring: boolean;
	depositor: string;
	verifier: string;
	deposit: number;
	raised: number;
	end: number;
	cap: string; // BigInt!
	lastContribution: AnyJson;
	firstSlot: number;
	lastSlot: number;
	trieIndex: number;
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

		const fundInfo = this.parseFundInfo(funds as Option<FundInfo>);

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
	 * @TODO Should sanitizeAndSend also Deal with bigint numbers?!
	 *
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
			const funds: FundInfo | {} = includeFundInfo
				? this.parseFundInfo(k[1] as Option<FundInfo>)
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

	private parseFundInfo(entry: Option<FundInfo>): IFundInfo {
		const unwrapEntry = entry.unwrap();

		return {
			retiring: unwrapEntry.retiring.isTrue ? true : false,
			depositor: unwrapEntry.depositor.toString(),
			verifier: unwrapEntry.verifier.toString(),
			deposit: unwrapEntry.deposit.toNumber(),
			raised: unwrapEntry.raised.toNumber(),
			end: unwrapEntry.end.toNumber(),
			cap: unwrapEntry.cap.toString(), // This is a really large number TODO find the right type to deal with this
			lastContribution: unwrapEntry.lastContribution.toJSON(),
			firstSlot: unwrapEntry.firstSlot.toNumber(),
			lastSlot: unwrapEntry.lastSlot.toNumber(),
			trieIndex: unwrapEntry.trieIndex.toNumber(),
		};
	}

	private currentLeasePeriodIndex(blockHeight: BN, leasePeriod: BN): number {
		return blockHeight.div(leasePeriod).toNumber();
	}
}
