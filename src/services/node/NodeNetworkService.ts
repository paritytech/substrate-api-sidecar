import { INodeNetwork } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeNetworkService extends AbstractService {
	async fetchNetwork(): Promise<INodeNetwork> {
		const [
			{ peers, isSyncing, shouldHavePeers },
			localPeerId,
			nodeRoles,
			localListenAddresses,
		] = await Promise.all([
			this.api.rpc.system.health(),
			this.api.rpc.system.localPeerId(),
			this.api.rpc.system.nodeRoles(),
			this.api.rpc.system.localListenAddresses(),
		]);

		let systemPeers;
		try {
			systemPeers = await this.api.rpc.system.peers();
		} catch {
			systemPeers = 'Cannot query system_Peers from node.';
		}

		return {
			nodeRoles,
			isSyncing,
			peers,
			shouldHavePeers,
			localPeerId,
			localListenAddresses,
			systemPeers,
		};
	}
}
