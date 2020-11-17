import { Bool, Text, u64, Vec } from '@polkadot/types';
import { NodeRole, PeerInfo } from '@polkadot/types/interfaces';

export interface INodeNetwork {
	nodeRoles: Vec<NodeRole>;
	numPeers: u64;
	isSyncing: Bool;
	shouldHavePeers: Bool;
	localPeerId: Text;
	localListenAddresses: Vec<Text>;
	peersInfo: string | Vec<PeerInfo>;
}
