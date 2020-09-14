import { Codec } from '../polkadot-js';
import { IAt, ISanitizedStorageItemMetadata } from '.';
export interface IPalletStorageItem {
	at: IAt;
	pallet: string;
	palletIndex: number;
	storageItem: string;
	key1: string | undefined;
	key2: string | undefined;
	value: Codec;
	metadata: ISanitizedStorageItemMetadata | undefined;
}
