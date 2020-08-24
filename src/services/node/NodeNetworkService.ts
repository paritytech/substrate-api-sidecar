import { INodeNetwork } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeNetworkService extends AbstractService {
	async fetchNetwork(): Promise<INodeNetwork> {
		const [
			{ peers: numPeers, isSyncing, shouldHavePeers },
			localPeerId,
			nodeRoles,
			localListenAddresses,
		] = await Promise.all([
			this.api.rpc.system.health(),
			this.api.rpc.system.localPeerId(),
			this.api.rpc.system.nodeRoles(),
			this.api.rpc.system.localListenAddresses(),
		]);

		let peersInfo;
		try {
			peersInfo = await this.api.rpc.system.peers();
		} catch {
			peersInfo = 'Cannot query system_peers from node.';
		}

		return {
			nodeRoles,
			numPeers,
			isSyncing,
			shouldHavePeers,
			localPeerId,
			localListenAddresses,
			peersInfo,
		};
	}
}
