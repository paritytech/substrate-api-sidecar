import { BlockHash } from '@polkadot/types/interfaces';
import { INodeNetwork } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class NodeNetworkService extends AbstractService {
	async fetchNetworking(hash: BlockHash): Promise<INodeNetwork> {
		const api = await this.ensureMeta(hash);

		const [
			{ peers, isSyncing, shouldHavePeers },
			localPeerId,
			nodeRoles,
			localListenAddresses,
		] = await Promise.all([
			api.rpc.system.health(),
			api.rpc.system.localPeerId(),
			api.rpc.system.nodeRoles(),
			api.rpc.system.localListenAddresses(),
		]);

		let systemPeers;
		try {
			systemPeers = await api.rpc.system.peers();
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
