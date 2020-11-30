import { Text } from '@polkadot/types';

import { IAt, ISanitizedStorageItemMetadata } from '.';
import { IPallet } from './Pallet';

export interface IPalletStorage extends IPallet {
	at: IAt;
	pallet: string;
	palletIndex: number;
	items: ISanitizedStorageItemMetadata[] | Text[];
}
