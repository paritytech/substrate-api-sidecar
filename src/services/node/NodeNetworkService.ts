import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class NodeNetworkService extends AbstractService {
	async fetchNetworking(hash: BlockHash): Promise<any> {
		const api = await this.ensureMeta(hash);

		const [
			{ peers, isSyncing, shouldHavePeers },
			localPeerId,
			nodeRoles,
			localListenAddresses,
			// systemPeers,
		] = await Promise.all([
			api.rpc.system.health(),
			api.rpc.system.localPeerId(),
			api.rpc.system.nodeRoles(),
			api.rpc.system.localListenAddresses(),
			// api.rpc.system.peers(),
		]);

		console.log(await api.rpc.system.peers());

		return {
			nodeRoles,
			peers,
			isSyncing,
			shouldHavePeers,
			localPeerId,
			localListenAddresses,
			// systemPeers,
		};
	}
}
