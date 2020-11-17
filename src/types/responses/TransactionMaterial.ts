import { BlockHash } from '@polkadot/types/interfaces';
import { u32 as U32 } from '@polkadot/types/primitive';

import { IAt } from '.';

export interface ITransactionMaterial {
	at: IAt;
	genesisHash: BlockHash;
	chainName: string;
	specName: string;
	specVersion: U32;
	txVersion: U32;
	metadata?: string;
}
