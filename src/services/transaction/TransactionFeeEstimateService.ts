import { BlockHash, RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionFeeEstimateService extends AbstractService {
	/**
	 * Fetch estimated fee information for a SCALE-encoded extrinsic at a given
	 * block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param extrinsic scale encoded extrinsic to get a fee estimate for
	 */
	async fetchTransactionFeeEstimate(
		hash: BlockHash,
		transaction: string
	): Promise<RuntimeDispatchInfo> {
		const { api } = this;

		try {
			return await api.rpc.payment.queryInfo(transaction, hash);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				at: {
					hash: hash.toString(),
				},
				error: 'Unable to fetch fee info',
				transaction,
				cause,
				stack,
			};
		}
	}
}
