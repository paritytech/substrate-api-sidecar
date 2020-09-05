import { ChainProperties, ChainType } from '@polkadot/types/interfaces';
import { Text, u32 } from '@polkadot/types/primitive';

import { IAt } from '.';

export interface IRuntimeSpec {
	at: IAt;
	authoringVersion: u32;
	transactionVersion: u32;
	implVersion: u32;
	specName: Text;
	specVersion: u32;
	chainType: ChainType;
	properties: ChainProperties;
}
