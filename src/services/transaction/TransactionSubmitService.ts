import { Hash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class TransactionSubmitService extends AbstractService {
	/**
	 * Submit a fully formed scale encoded extrinsic for block inclusion.
	 *
	 * @param extrinsic scale encoded extrinsic to submit
	 */
	async submitTransaction(extrinsic: string): Promise<{ hash: Hash }> {
		const api = await this.ensureMeta(
			await this.api.rpc.chain.getFinalizedHead()
		);

		let tx;

		try {
			tx = api.tx(extrinsic);
		} catch (err) {
			// TODO toString type guard
			throw {
				error: 'Failed to parse a tx',
				data: extrinsic,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}

		try {
			const hash = await api.rpc.author.submitExtrinsic(tx);

			return {
				hash,
			};
		} catch (err) {
			throw {
				error: 'Failed to submit a tx',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}
	}
}
