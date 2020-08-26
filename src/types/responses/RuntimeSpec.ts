import { ChainProperties, ChainType } from '@polkadot/types/interfaces';
import { Text, u32 } from '@polkadot/types/primitive';

export interface IRuntimeSpec {
	authoringVersion: u32;
	transactionVersion: u32;
	implVersion: u32;
	specName: Text;
	specVersion: u32;
	chainType: ChainType;
	properties: ChainProperties;
}
