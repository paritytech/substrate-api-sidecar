import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class NodeVersionService extends AbstractService {
	async fetchVersion(hash: BlockHash): Promise<any> {
		const api = await this.ensureMeta(hash);

		const [{ implVersion, implName }, chain] = await Promise.all([
			api.rpc.state.getRuntimeVersion(),
			api.rpc.system.chain(),
		]);

		console.log(api);

		return {
			clientImplVersion: implVersion,
			clientImplName: implName,
			chain,
		};
	}
}
