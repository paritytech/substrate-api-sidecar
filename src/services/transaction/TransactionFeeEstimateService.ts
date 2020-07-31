import { BlockHash, RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import { isToString } from '../../types/util';
import { AbstractService } from '../AbstractService';

export class TransactionFeeEstimateService extends AbstractService {
	/**
	 * Fetch estimated fee information for a scale encoded extrinsic at a given
	 * block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param extrinsic scale encoded extrinsic to get a fee estimate for
	 */
	async fetchTransactionFeeEstimate(
		hash: BlockHash,
		extrinsic: string
	): Promise<RuntimeDispatchInfo> {
		const api = await this.ensureMeta(hash);

		try {
			return await api.rpc.payment.queryInfo(extrinsic, hash);
		} catch (err) {
			throw {
				error: 'Unable to fetch fee info',
				data: {
					extrinsic,
					block: hash,
				},
				cause: isToString(err) ? err.toString() : (err as string),
			};
		}
	}
}
