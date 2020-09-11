import { StorageEntryMetadataV11 } from '@polkadot/types/interfaces';
import { Text } from '@polkadot/types/primitive';

import { Codec } from '../polkadot-js';
import { IAt } from './At';
export interface IPalletStorageItem {
	at: IAt;
	pallet: Text;
	storageItem: Text;
	key1: string | undefined;
	key2: string | undefined;
	value: Codec;
	metadata: StorageEntryMetadataV11 | undefined;
}
