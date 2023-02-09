// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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
import {
	BlockHash,
	MetadataV13,
	MetadataV14,
	StorageEntryMetadataV13,
	StorageEntryMetadataV14,
} from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import {
	IPalletStorage,
	IPalletStorageItem,
	ISanitizedStorageItemMetadata,
} from 'src/types/responses';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
	adjustMetadataV13Arg: boolean;
}

interface IFetchStorageItemArgs extends IFetchPalletArgs {
	storageItemId: string;
	keys: string[];
	metadata: boolean;
	adjustMetadataV13Arg: boolean;
}

/**
 * This is where these networks switched to v9110 which introduces v14 Metadata.
 */
const upgradeBlocks = {
	kusama: 9625129,
	polkadot: 7229126,
	westend: 7766392,
};

export class PalletsStorageService extends AbstractPalletsService {
	async fetchStorageItem(
		historicApi: ApiDecoration<'promise'>,
		{
			hash,
			palletId,
			storageItemId,
			keys,
			metadata,
			adjustMetadataV13Arg,
		}: IFetchStorageItemArgs
	): Promise<IPalletStorageItem> {
		const metadataFieldType = 'storage';
		const chosenMetadata = await this.chooseMetadataVersion(
			historicApi,
			hash,
			adjustMetadataV13Arg
		);
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			chosenMetadata,
			palletId,
			metadataFieldType
		);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `findPalletItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType
		) as StorageEntryMetadataV13 | StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta =
				this.normalizeStorageItemMeta(storageItemMeta);
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
		{
			hash,
			palletId,
			onlyIds,
			adjustMetadataV13Arg,
		}: IFetchPalletArgs & { onlyIds: boolean }
	): Promise<IPalletStorage> {
		const metadataFieldType = 'storage';
		const chosenMetadata = await this.chooseMetadataVersion(
			historicApi,
			hash,
			adjustMetadataV13Arg
		);
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			chosenMetadata,
			palletId,
			metadataFieldType
		);

		let items: [] | ISanitizedStorageItemMetadata[] | Text[];
		if (palletMeta.storage.isNone) {
			items = [];
		} else if (onlyIds) {
			items = palletMeta.storage
				.unwrap()
				.items.map((itemMeta) => itemMeta.name);
		} else {
			items = palletMeta.storage
				.unwrap()
				.items.map((itemMeta) => this.normalizeStorageItemMeta(itemMeta));
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
	 * This will grab either V13 or V14 metadata for pallets. The reason being is v14 introduced
	 * `StorageEntryTypeV14` which is different from `StorageEntryTypeV13` when it comes
	 * to `asMap`. This will ultimately give different responses, and we want to make sure
	 * we preserve the integrity of older blocks.
	 *
	 * @param hash BlockHash to query
	 */
	private chooseMetadataVersion = async (
		historicApi: ApiDecoration<'promise'>,
		hash: BlockHash,
		adjustMetadataV13Arg: boolean
	): Promise<MetadataV13 | MetadataV14> => {
		const [blockHeader, { specName }] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.rpc.state.getRuntimeVersion(),
		]);

		const blockNumber = blockHeader.number.toNumber();

		let chosenMetadata;
		if (
			blockNumber < upgradeBlocks[specName.toString()] &&
			adjustMetadataV13Arg
		) {
			const historicMetadata = await this.api.rpc.state.getMetadata(hash);
			chosenMetadata = historicMetadata.asV13;
		} else {
			chosenMetadata = historicApi.registry.metadata;
		}

		return chosenMetadata;
	};

	/**
	 * Normalize storage item metadata by running it through `sanitizeNumbers` and
	 * converting the docs section from an array of strings to a single string
	 * joined with new line characters.
	 *
	 * @param storageItemMeta polkadot-js StorageEntryMetadataV12
	 */
	private normalizeStorageItemMeta(
		storageItemMeta: StorageEntryMetadataV14 | StorageEntryMetadataV13
	): ISanitizedStorageItemMetadata {
		const normalizedStorageItemMeta = sanitizeNumbers(
			storageItemMeta
		) as unknown as ISanitizedStorageItemMetadata;

		normalizedStorageItemMeta.docs = this.sanitizeDocs(storageItemMeta.docs);

		return normalizedStorageItemMeta;
	}
}
