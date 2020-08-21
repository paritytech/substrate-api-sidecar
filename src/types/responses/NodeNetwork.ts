import { Text, u64, Vec } from '@polkadot/types';
import { NodeRole, PeerInfo } from '@polkadot/types/interfaces';
import Bool from '@polkadot/types/primitive/Bool';

export interface INodeNetwork {
	nodeRoles: Vec<NodeRole>;
	isSyncing: Bool;
	peers: u64;
	shouldHavePeers: Bool;
	localPeerId: Text;
	localListenAddresses: Vec<Text>;
	systemPeers: string | Vec<PeerInfo>;
}
