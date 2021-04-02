import { Option } from '@polkadot/types/codec';
import { BlockHash, FundInfo, ParaId } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import {
	ICrowdloansInfoResponse,
	ICrowdloansResponse,
	IEntries,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class ParasService extends AbstractService {
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

		const entries: IEntries[] = (
			await this.api.query.crowdloan.funds.entries()
		).map((k) => {
			const paraId = (k[0].args[0] as ParaId).toNumber();
			const funds: Option<FundInfo> | {} = includeFundInfo
				? (k[1] as Option<FundInfo>)
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
}
