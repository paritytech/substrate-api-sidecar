import {
	BlockHash,
	ModuleMetadataV11,
	StorageEntryMetadataV11,
} from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';
import { IPalletStorageItem } from 'src/types/responses/PalletStorageItem';

import { AbstractService } from '../AbstractService';

export class PalletsStorageItemService extends AbstractService {
	async fetchStorageItem({
		hash,
		palletId,
		storageItemId,
		key1,
		key2,
		metadata,
	}: {
		hash: BlockHash;
		palletId: string;
		storageItemId: string;
		key1: string | undefined;
		key2: string | undefined;
		metadata: boolean;
	}): Promise<IPalletStorageItem> {
		if (!this.api.query[palletId]) {
			throw new BadRequest(
				`Unrecognized palletId: "${palletId}" was not recognized as a queryable pallet. Only came camel case pallet names are accepted as a palletId`
			);
		}

		if (!this.api.query[palletId][storageItemId]) {
			throw new BadRequest(
				`Invalid storageItemId: "${storageItemId}" was not recognized as queryable storage item for ${palletId}. Only camel case storage item names are accepted as storageItemId.`
			);
		}

		const [palletMeta] = this.findPalletMeta(palletId);

		const [storageItemMeta] = this.findStorageItemMeta(
			palletMeta,
			storageItemId
		);

		const [value, { number }] = await Promise.all([
			this.api.query[palletId.toLowerCase()][storageItemId].at(
				hash,
				key1,
				key2
			),
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletMeta.name,
			storageItem: storageItemMeta.name,
			key1,
			key2,
			value,
			metadata: metadata ? storageItemMeta : undefined,
		};
	}

	/**
	 * Find the storage item's metadata within the pallets's metadata.
	 *
	 * @param palletMeta the metadata of the pallet that contains the storage item
	 * @param storageId name of the storage item in camel or pascal case
	 */
	private findStorageItemMeta(
		palletMeta: ModuleMetadataV11,
		storageItemId: string
	): [StorageEntryMetadataV11, number] {
		if (palletMeta.storage.isNone) {
			throw new InternalServerError(
				`No storage items found in ${palletMeta.name.toString()}'s metadata`
			);
		}
		const palletMetaStorage = palletMeta.storage.unwrap().items;
		const storageItemMetaIdx = palletMetaStorage.findIndex(
			(item) => item.name.toLowerCase() === storageItemId.toLowerCase()
		);
		if (storageItemMetaIdx === -1) {
			throw new InternalServerError(
				`Could not find storage item ("${storageItemId}") in metadata.`
			);
		}
		const storageItemMeta = palletMetaStorage[storageItemMetaIdx];

		return [storageItemMeta, storageItemMetaIdx];
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet.
	 */
	private findPalletMeta(palletId: string): [ModuleMetadataV11, number] {
		const palletMetaIdx = this.api.runtimeMetadata.asLatest.modules.findIndex(
			(mod) => mod.name.toLowerCase() === palletId.toLowerCase()
		);
		if (palletMetaIdx === -1) {
			throw new InternalServerError(
				`Could not find pallet ("${palletId}")in metadata.`
			);
		}
		const palletMeta = this.api.runtimeMetadata.asLatest.modules[
			palletMetaIdx
		];

		return [palletMeta, palletMetaIdx];
	}
}
