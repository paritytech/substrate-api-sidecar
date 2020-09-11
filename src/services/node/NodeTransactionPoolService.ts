import { INodeTransactionPool } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	async fetchTransactionPool(): Promise<INodeTransactionPool> {
		const { api } = this;

		const extrinsics = await api.rpc.author.pendingExtrinsics();

		const pool = extrinsics.map((ext) => {
			return {
				hash: ext.hash.toHex(),
				encodedExtrinsic: ext.toHex(),
			};
		});

		return {
			pool,
		};
	}
}
