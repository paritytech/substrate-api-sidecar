import { BlockHash } from '@polkadot/types/interfaces';

export interface IAt {
	hash: string | BlockHash;
	height: string;
}
