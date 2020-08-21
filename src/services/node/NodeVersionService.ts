import { INodeVersion } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeVersionService extends AbstractService {
	async fetchVersion(): Promise<INodeVersion> {
		const [{ implVersion, implName }, chain] = await Promise.all([
			this.api.rpc.state.getRuntimeVersion(),
			this.api.rpc.system.chain(),
		]);

		return {
			clientImplVersion: implVersion,
			clientImplName: implName,
			chain,
		};
	}
}
