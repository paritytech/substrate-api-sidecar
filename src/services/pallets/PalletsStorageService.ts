import { ApiDecoration } from '@polkadot/api/types';
import { Text, Vec } from '@polkadot/types';
import {
	BlockHash,
	MetadataV13,
	MetadataV14,
	ModuleMetadataV13,
	PalletMetadataV14,
	StorageEntryMetadataV13,
	StorageEntryMetadataV14,
} from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { BadRequest, InternalServerError } from 'http-errors';
import {
	IPalletStorage,
	IPalletStorageItem,
	ISanitizedStorageItemMetadata,
} from 'src/types/responses';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { AbstractService } from '../AbstractService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
	adjustMetadataV13Arg: boolean;
}

interface IFetchStorageItemArgs extends IFetchPalletArgs {
	storageItemId: string;
	key1?: string;
	key2?: string;
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

export class PalletsStorageService extends AbstractService {
	async fetchStorageItem(
		historicApi: ApiDecoration<'promise'>,
		{
			hash,
			palletId,
			storageItemId,
			key1,
			key2,
			metadata,
			adjustMetadataV13Arg,
		}: IFetchStorageItemArgs
	): Promise<IPalletStorageItem> {
		const chosenMetadata = await this.chooseMetadataVersion(
			historicApi,
			hash,
			adjustMetadataV13Arg
		);
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			chosenMetadata,
			historicApi,
			palletId
		);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `findStorageItemMeta` will throw.
		const storageItemMeta = this.findStorageItemMeta(palletMeta, storageItemId);

		let normalizedStorageItemMeta;
		if (metadata) {
			normalizedStorageItemMeta =
				this.normalizeStorageItemMeta(storageItemMeta);
		}

		const [value, { number }] = await Promise.all([
			historicApi.query[palletName][storageItemId](key1, key2),
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
			key1,
			key2,
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
		const chosenMetadata = await this.chooseMetadataVersion(
			historicApi,
			hash,
			adjustMetadataV13Arg
		);
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			chosenMetadata,
			historicApi,
			palletId
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

	/**
	 * Find the storage item's metadata within the pallets's metadata.
	 *
	 * @param palletMeta the metadata of the pallet that contains the storage item
	 * @param storageId name of the storage item in camel or pascal case
	 */
	private findStorageItemMeta(
		palletMeta: PalletMetadataV14 | ModuleMetadataV13,
		storageItemId: string
	): StorageEntryMetadataV14 | StorageEntryMetadataV13 {
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
				`Could not find storage item ("${storageItemId}") in metadata. Storage item names are expected to be in camel case, e.g. 'storageItemId'`
			);
		}

		return palletMetaStorage[storageItemMetaIdx];
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet as a pallet name or index.
	 */
	private findPalletMeta(
		adjustedMetadata: MetadataV13 | MetadataV14,
		historicApi: ApiDecoration<'promise'>,
		palletId: string
	): [PalletMetadataV14 | ModuleMetadataV13, number] {
		const metadataType = adjustedMetadata.toRawType();

		let pallets: Vec<PalletMetadataV14> | Vec<ModuleMetadataV13>;
		if (metadataType.includes('MetadataV13')) {
			pallets = adjustedMetadata['modules'] as Vec<ModuleMetadataV13>;
		} else {
			pallets = adjustedMetadata['pallets'] as Vec<PalletMetadataV14>;
		}

		const { isValidPalletName, isValidPalletIndex, parsedPalletId } =
			this.validPalletId(historicApi, pallets, palletId);

		const filtered = pallets.filter((mod) => mod.storage.isSome);

		let palletMeta: PalletMetadataV14 | ModuleMetadataV13 | undefined;
		let palletIdx: number | undefined;

		if (isValidPalletIndex) {
			palletIdx = parsedPalletId as number;
			for (const [_sectionIdx, section] of filtered.entries()) {
				const idx = section.index.eqn(255)
					? _sectionIdx
					: section.index.toNumber();

				if (idx === palletIdx) {
					palletMeta = section;
					break;
				}
			}
		} else if (isValidPalletName) {
			for (const [_sectionIdx, section] of filtered.entries()) {
				if (section.name.toLowerCase() === palletId.toLowerCase()) {
					// ModuleMetadataV11 and lower have an `index` but they use 255 as a reserve value to signify
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
		}

		if (!palletMeta || palletIdx === undefined || palletIdx < 0) {
			throw new BadRequest(
				`"${palletId}" was not recognized as a queryable pallet.`
			);
		}

		return [palletMeta, palletIdx];
	}

	private validPalletId(
		historicApi: ApiDecoration<'promise'>,
		modules: Vec<PalletMetadataV14> | Vec<ModuleMetadataV13>,
		palletId: string
	): {
		isValidPalletName: boolean;
		isValidPalletIndex: boolean;
		parsedPalletId: string | number;
	} {
		// Either a pallet name (string) or a pallet index (number)
		const parsedPalletId = PalletsStorageService.palletIdxOrName(palletId);

		const isValidPalletName =
			typeof parsedPalletId === 'string' && !!historicApi.query[palletId];

		const isValidPalletIndex =
			typeof parsedPalletId === 'number' &&
			modules.some((meta, idx) =>
				meta.index.eqn(255)
					? idx === parsedPalletId
					: meta.index.eqn(parsedPalletId)
			);

		return {
			isValidPalletName,
			isValidPalletIndex,
			parsedPalletId,
		};
	}

	/**
	 * Identify if a pallet Identifier should be an index or a string. If it should
	 * be an index return a number and if it should be a name return a string.
	 *
	 * @param palletId FRAME pallet identifier as a pallet name or index
	 */
	private static palletIdxOrName(palletId: string): string | number {
		const maybeIdx = Number(palletId);

		if (Number.isInteger(maybeIdx)) {
			return maybeIdx;
		}

		return palletId;
	}
}
