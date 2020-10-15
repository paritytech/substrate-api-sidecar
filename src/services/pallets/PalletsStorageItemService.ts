import {
	BlockHash,
	ModuleMetadataV12,
	StorageEntryMetadataV12,
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

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(palletId);

		let sanitizedStorageItemMeta;
		if (metadata) {
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
			palletIndex: palletMetaIdx,
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
		palletMeta: ModuleMetadataV12,
		storageItemId: string
	): StorageEntryMetadataV12 {
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

		return palletMetaStorage[storageItemMetaIdx];
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet.
	 */
	private findPalletMeta(palletId: string): [ModuleMetadataV12, number] {
		const { modules } = this.api.runtimeMetadata.asLatest;

		const filtered = modules.filter((mod) => mod.storage.isSome);

		let palletMeta: ModuleMetadataV12 | undefined;
		let palletIdx: number | undefined;
		for (const [_sectionIdx, section] of filtered.entries()) {
			if (section.name.toLowerCase() === palletId.toLowerCase()) {
				// ModuleMetadataV11 and lower have a `index` but they use 255 as a reserve value to signify
				// that they are meaningless. So if the index is 255 we use its index in the filtered array
				// of modules. But if the index is something else than we use `ModuleMetadataV12.index`.
				// The reason they use a reserve value is that all previous ModuleMetadata versions actually
				// extend the latest. So since the intro of ModuleMetadataV12 all versions have `index` in
				// polkadot-js, but at the substrate level, only versions >= 12 have pallet `index`.
				// https://github.com/polkadot-js/api/pull/2599
				// https://github.com/paritytech/substrate/pull/6969
				// https://github.com/polkadot-js/api/issues/2596
				palletIdx = section.index.eqn(255)
					? _sectionIdx
					: section.index.toNumber();
				palletMeta = section;
				break;
			}
		}

		if (!palletMeta || palletIdx === undefined || palletIdx < 0) {
			throw new InternalServerError(
				`Could not find pallet ("${palletId}")in metadata.`
			);
		}

		return [palletMeta, palletIdx];
	}
}
