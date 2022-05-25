import { INodeTransactionPool } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	async fetchTransactionPool(
		includeTip: boolean
	): Promise<INodeTransactionPool> {
		const { api } = this;

		const extrinsics = await api.rpc.author.pendingExtrinsics();

		if (includeTip) {
			return {
				pool: extrinsics.map((ext) => {
					return {
						hash: ext.hash.toHex(),
						encodedExtrinsic: ext.toHex(),
						tip: ext.tip.toString(),
					};
				}),
			};
		} else {
			return {
				pool: extrinsics.map((ext) => {
					return {
						hash: ext.hash.toHex(),
						encodedExtrinsic: ext.toHex(),
					};
				}),
			};
		}
	}
}
