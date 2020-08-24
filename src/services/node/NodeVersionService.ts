import { INodeVersion } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeVersionService extends AbstractService {
	async fetchVersion(): Promise<INodeVersion> {
		const [
			{ implName: clientImplName },
			chain,
			clientVersion,
		] = await Promise.all([
			this.api.rpc.state.getRuntimeVersion(),
			this.api.rpc.system.chain(),
			this.api.rpc.system.version(),
		]);

		return {
			clientVersion,
			clientImplName,
			chain,
		};
	}
}
