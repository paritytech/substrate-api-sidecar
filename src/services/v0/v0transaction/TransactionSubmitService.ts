import { Hash } from '@polkadot/types/interfaces';

import { AbstractService } from '../../AbstractService';
import { extractCauseAndStack } from '../../transaction/extractCauseAndStack';

export class TransactionSubmitService extends AbstractService {
	/**
	 * Submit a fully formed scale encoded extrinsic for block inclusion.
	 *
	 * @param extrinsic scale encoded extrinsic to submit
	 */
	async submitTransaction(extrinsic: string): Promise<{ hash: Hash }> {
		const { api } = this;

		let tx;

		try {
			tx = api.tx(extrinsic);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				error: 'Failed to parse a tx',
				data: extrinsic,
				cause,
				stack,
			};
		}

		try {
			const hash = await api.rpc.author.submitExtrinsic(tx);

			return {
				hash,
			};
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				error: 'Failed to submit a tx',
				data: extrinsic,
				cause,
				stack,
			};
		}
	}
}
