import { Text, u64, Vec } from '@polkadot/types';
import { NodeRole, PeerInfo } from '@polkadot/types/interfaces';
import Bool from '@polkadot/types/primitive/Bool';

export interface INodeNetwork {
	nodeRoles: Vec<NodeRole>;
	numPeers: u64;
	isSyncing: Bool;
	shouldHavePeers: Bool;
	localPeerId: Text;
	localListenAddresses: Vec<Text>;
	peersInfo: string | Vec<PeerInfo>;
}
