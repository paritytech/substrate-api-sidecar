import { BlockHash } from '@polkadot/types/interfaces';
import U32 from '@polkadot/types/primitive/U32';

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
