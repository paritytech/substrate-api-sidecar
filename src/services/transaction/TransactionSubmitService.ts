import { Hash } from '@polkadot/types/interfaces';
import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionSubmitService extends AbstractService {
	/**
	 * Submit a fully formed scale encoded extrinsic for block inclusion.
	 *
	 * @param extrinsic scale encoded extrinsic to submit
	 */
	async submitTransaction(
		hash: BlockHash,
		transaction: string
	): Promise<{ hash: Hash }> {
		const api = await this.ensureMeta(hash);

		let tx;

		try {
			tx = api.tx(transaction);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				error: 'Failed to parse transaction.',
				transaction,
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
				error: 'Failed to submit transaction.',
				transaction,
				cause,
				stack,
			};
		}
	}
}
