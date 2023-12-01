// Copyright 2017-2023 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiDecoration } from '@polkadot/api/types';
import { Text } from '@polkadot/types';
import { BlockHash, StorageEntryMetadataV14 } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { IPalletStorage, IPalletStorageItem, ISanitizedStorageItemMetadata } from 'src/types/responses';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchStorageItemArgs extends IFetchPalletArgs {
	storageItemId: string;
	keys: string[];
	metadata: boolean;
}

export class PalletsStorageService extends AbstractPalletsService {
	async fetchStorageItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, storageItemId, keys, metadata }: IFetchStorageItemArgs,
	): Promise<IPalletStorageItem> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `getStorageItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType,
		) as StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta = this.normalizeStorageItemMeta(storageItemMeta);
		}

		const [value, { number }] = await Promise.all([
			historicApi.query[palletName][storageItemId](...keys),
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletName,
			palletIndex: palletMetaIdx,
			storageItem: storageItemId,
			keys,
			value,
			metadata: normalizedStorageItemMeta,
		};
	}

	async fetchStorage(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletStorage> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);

		let items: [] | ISanitizedStorageItemMetadata[] | Text[];
		if (palletMeta.storage.isNone) {
			items = [];
		} else if (onlyIds) {
			items = palletMeta.storage.unwrap().items.map((itemMeta) => itemMeta.name);
		} else {
			items = palletMeta.storage.unwrap().items.map((itemMeta) => this.normalizeStorageItemMeta(itemMeta));
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			items,
		};
	}

	/**
	 * Normalize storage item metadata by running it through `sanitizeNumbers` and
	 * converting the docs section from an array of strings to a single string
	 * joined with new line characters.
	 *
	 * @param storageItemMeta polkadot-js StorageEntryMetadataV14
	 */
	private normalizeStorageItemMeta(storageItemMeta: StorageEntryMetadataV14): ISanitizedStorageItemMetadata {
		const normalizedStorageItemMeta = sanitizeNumbers(storageItemMeta) as unknown as ISanitizedStorageItemMetadata;

		normalizedStorageItemMeta.docs = this.sanitizeDocs(storageItemMeta.docs);

		return normalizedStorageItemMeta;
	}
}
