import { Text } from '@polkadot/types';

export interface INodeVersion {
	clientVersion: Text;
	clientImplName: Text;
	chain: Text;
}
