import { BlockHash, RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class TransactionsFeeEstimateService extends AbstractService {
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
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}
	}
}
