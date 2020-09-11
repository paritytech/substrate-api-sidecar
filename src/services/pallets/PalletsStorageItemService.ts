import {
	BlockHash,
	ModuleMetadataV11,
	StorageEntryMetadataV11,
} from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';
import { ISanitizedStorageItemMetadata } from 'src/types/responses';
import { IPalletStorageItem } from 'src/types/responses/PalletStorageItem';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
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
		console.log(palletId);
		if (!this.api.query[palletId]) {
			throw new BadRequest(
				`"${palletId}" was not recognized as a queryable pallet. Pallet names are expected to be in camel case, e.g. 'palletId`
			);
		}

		if (!this.api.query[palletId][storageItemId]) {
			throw new BadRequest(
				`"${storageItemId}" was not recognized as queryable storage item for ${palletId}. Storage item names are expected to be in camel case, e.g. 'storageItemId'`
			);
		}

		let sanitizedStorageItemMeta;
		if (metadata) {
			const palletMeta = this.findPalletMeta(palletId);

			const storageItemMeta = this.findStorageItemMeta(
				palletMeta,
				storageItemId
			);

			sanitizedStorageItemMeta = (sanitizeNumbers(
				storageItemMeta
			) as unknown) as ISanitizedStorageItemMetadata;
			sanitizedStorageItemMeta.documentation = this.sanitizeDocs(
				storageItemMeta.documentation
			);
		}

		const [value, { number }] = await Promise.all([
			this.api.query[palletId][storageItemId].at(hash, key1, key2),
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletId,
			storageItem: storageItemId,
			key1,
			key2,
			value,
			metadata: sanitizedStorageItemMeta,
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
	): StorageEntryMetadataV11 {
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

		return storageItemMeta;
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet.
	 */
	private findPalletMeta(palletId: string): ModuleMetadataV11 {
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

		return palletMeta;
	}
}
