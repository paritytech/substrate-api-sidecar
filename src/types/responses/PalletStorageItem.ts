import { Codec } from '../polkadot-js';
import { IPallet, ISanitizedStorageItemMetadata } from '.';

export interface IPalletStorageItem extends IPallet {
	storageItem: string;
	key1: string | undefined;
	key2: string | undefined;
	value: Codec;
	metadata: ISanitizedStorageItemMetadata | undefined;
}
