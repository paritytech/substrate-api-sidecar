import { Text, u32 } from '@polkadot/types';

export interface INodeVersion {
	clientImplVersion: u32;
	clientImplName: Text;
	chain: Text;
}
