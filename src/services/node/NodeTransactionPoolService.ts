import { Vec } from '@polkadot/types';
import Extrinsic from '@polkadot/types/extrinsic/Extrinsic';
import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	async fetchTransactionPool(hash: BlockHash): Promise<Vec<Extrinsic>> {
		const api = await this.ensureMeta(hash);

		return await api.rpc.author.pendingExtrinsics();
	}
}
