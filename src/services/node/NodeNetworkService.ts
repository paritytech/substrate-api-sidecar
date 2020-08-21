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

		let peersInfos;
		try {
			peersInfos = await this.api.rpc.system.peers();
		} catch {
			peersInfos = 'Cannot query system_peers from node.';
		}

		return {
			nodeRoles,
			isSyncing,
			numPeers,
			shouldHavePeers,
			localPeerId,
			localListenAddresses,
			peersInfos,
		};
	}
}
