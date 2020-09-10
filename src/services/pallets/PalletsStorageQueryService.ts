import { BlockHash } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';

import { AbstractService } from '../AbstractService';

export class PalletsStorageQueryService extends AbstractService {
	async fetchStorageItem(
		hash: BlockHash,
		palletId: string,
		storageId: string,
		key1: string | undefined,
		key2: string | undefined,
		metadata: boolean
	) {
		if (!this.api.query[palletId]) {
			throw new BadRequest(
				'Invalid palletId. Currently only camel case pallet names are expected as a palletId.'
			);
		}

		if (!this.api.query[palletId][storageId]) {
			throw new BadRequest(
				'Invalid storageItemId. Currently only camel case storage item names are expected as storageItemId.'
			);
		}

		// Find the pallet's metadata info
		const palletMetaIdx = this.api.runtimeMetadata.asLatest.modules.findIndex(
			(mod) => mod.name.toLowerCase() === palletId.toLowerCase()
		);
		if (palletMetaIdx === -1) {
			throw new InternalServerError('Could not find pallet in metadata.');
		}
		const palletMeta = this.api.runtimeMetadata.asLatest.modules[
			palletMetaIdx
		];

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
}
