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
		storageId,
		key1,
		key2,
		metadata,
	}: {
		hash: BlockHash;
		palletId: string;
		storageId: string;
		key1: string | undefined;
		key2: string | undefined;
		metadata: boolean;
	}): Promise<IPalletStorageItem> {
		if (!this.api.query[palletId]) {
			throw new BadRequest(
				`Invalid palletId: ${palletId}. Currently only pallet names are expected as a palletId.`
			);
		}

		if (!this.api.query[palletId][storageId]) {
			throw new BadRequest(
				`Invalid storageItemId: ${storageId}. Currently only camel case storage item names are expected as storageItemId.`
			);
		}

		const [palletMeta] = this.findPalletMeta(palletId);

		const [storageItemMeta] = this.findStorageItemMeta(
			palletMeta,
			storageId
		);

		const [value, { number }] = await Promise.all([
			this.api.query[palletId.toLowerCase()][storageId].at(
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

	private findStorageItemMeta(
		palletMeta: ModuleMetadataV11,
		storageId: string
	): [StorageEntryMetadataV11, number] {
		// Find the storage item's metadata info within the pallets's metadata info
		if (palletMeta.storage.isNone) {
			throw new InternalServerError('No storage items found in metadata');
		}
		const palletMetaStorage = palletMeta.storage.unwrap().items;
		const storageItemMetaIdx = palletMetaStorage.findIndex(
			(item) => item.name.toLowerCase() === storageId.toLowerCase()
		);
		if (storageItemMetaIdx === -1) {
			throw new InternalServerError(
				'Could not find storage item in metadata'
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
			throw new InternalServerError('Could not find pallet in metadata.');
		}
		const palletMeta = this.api.runtimeMetadata.asLatest.modules[
			palletMetaIdx
		];

		return [palletMeta, palletMetaIdx];
	}
}
