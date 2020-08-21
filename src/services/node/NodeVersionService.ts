import { BlockHash } from '@polkadot/types/interfaces';
import { INodeVersion } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeVersionService extends AbstractService {
	async fetchVersion(hash: BlockHash): Promise<INodeVersion> {
		const api = await this.ensureMeta(hash);

		const [{ implVersion, implName }, chain] = await Promise.all([
			api.rpc.state.getRuntimeVersion(),
			api.rpc.system.chain(),
		]);

		return {
			clientImplVersion: implVersion,
			clientImplName: implName,
			chain,
		};
	}
}
