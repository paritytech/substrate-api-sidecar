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

import { ApiDecoration, ModuleErrors } from '@polkadot/api/types';
import { Text, Vec } from '@polkadot/types';
import {
	BlockHash,
	ErrorMetadataLatest,
	MetadataV14,
	PalletErrorMetadataV14,
	PalletMetadataV14,
} from '@polkadot/types/interfaces';
import { IsError } from '@polkadot/types/metadata/decorate/types';
import { stringCamelCase } from '@polkadot/util';
import { BadRequest, InternalServerError } from 'http-errors';
import {
	IPalletErrors,
	IPalletErrorsItem,
	ISanitizedErrorItemMetadata,
} from 'src/types/responses';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { AbstractService } from '../AbstractService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchErrorItemArgs extends IFetchPalletArgs {
	errorItemId: string;
	metadata: boolean;
}

export class PalletsErrorService extends AbstractService {
	async fetchErrorItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, errorItemId, metadata }: IFetchErrorItemArgs
	): Promise<IPalletErrorsItem> {
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			palletMetadata,
			historicApi,
			palletId
		);

		const palletName = stringCamelCase(palletMeta.name);
		const errors = historicApi.errors[palletName];

		// Even if `errorItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the error item not existing are that `findErrorItemMeta` will throw.
		const errorItemMetadata = this.findErrorItemMeta(
			palletMeta,
			errorItemId,
			errors
		);

		let normalizedErrorItemMeta;
		if (metadata) {
			normalizedErrorItemMeta = this.normalizeErrorItemMeta(
				(errorItemMetadata[1] as unknown as IsError).meta
			);
		}

		const [, { number }] = await Promise.all([
			historicApi.query[palletName][errorItemId],
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			errorItem: errorItemId,
			metadata: normalizedErrorItemMeta,
		};
	}

	async fetchErrors(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean }
	): Promise<IPalletErrors> {
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			metadata,
			historicApi,
			palletId
		);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const errors = historicApi.errors[palletMeta.name.toString().toLowerCase()];

		let items: [] | ErrorMetadataLatest[] | Text[];
		if (palletMeta.errors.isNone) {
			items = [];
		} else if (onlyIds) {
			items = Object.entries(errors).map(
				(errorItem) => errorItem[0] as unknown as Text
			);
		} else {
			items = [] as ErrorMetadataLatest[];
			for (const [, value] of Object.entries(errors)) {
				const item = value.meta;
				items.push(item);
			}
		}

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
	 * Normalize error item metadata by running it through `sanitizeNumbers` and
	 * converting the docs section from an array of strings to a single string
	 * joined with new line characters.
	 *
	 * @param errorItemMeta polkadot-js ErrorEntryMetadataV12
	 */
	private normalizeErrorItemMeta(
		errorItemMeta: ErrorMetadataLatest
	): ISanitizedErrorItemMetadata {
		const normalizedErrorItemMeta = sanitizeNumbers(
			errorItemMeta
		) as unknown as ISanitizedErrorItemMetadata;

		normalizedErrorItemMeta.docs = this.sanitizeDocs(errorItemMeta.docs);

		return normalizedErrorItemMeta;
	}

	/**
	 * Find the error item's metadata within the pallets's metadata.
	 *
	 * @param palletMeta the metadata of the pallet that contains the error item
	 * @param errorId name of the error item in camel or pascal case
	 */
	private findErrorItemMeta(
		palletMeta: PalletMetadataV14,
		errorItemId: string,
		errors: ModuleErrors<'promise'>
	): PalletErrorMetadataV14 {
		if (palletMeta.errors.isNone) {
			throw new InternalServerError(
				`No error items found in ${palletMeta.name.toString()}'s metadata`
			);
		}

		let errorItemMetaIdx = -1;
		for (const [, value] of Object.entries(errors)) {
			if (value.meta.name.toLowerCase() === errorItemId.toLowerCase()) {
				errorItemMetaIdx = value.meta.index.toNumber();
			}
		}

		if (errorItemMetaIdx === -1) {
			throw new InternalServerError(
				`Could not find error item ("${errorItemId}") in metadata. Error item names are expected to be in camel case, e.g. 'errorItemId'`
			);
		}

		return Object.entries(errors)[
			errorItemMetaIdx
		] as unknown as PalletErrorMetadataV14;
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet as a pallet name or index.
	 */
	private findPalletMeta(
		adjustedMetadata: MetadataV14,
		historicApi: ApiDecoration<'promise'>,
		palletId: string
	): [PalletMetadataV14, number] {
		const pallets: Vec<PalletMetadataV14> = adjustedMetadata['pallets'];
		const filtered: PalletMetadataV14[] = pallets.filter(
			(mod) => mod.errors.isSome
		);

		const { isValidPalletName, isValidPalletIndex, parsedPalletId } =
			this.validPalletId(historicApi, pallets, palletId);

		let palletMeta: PalletMetadataV14 | undefined;
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
		modules: Vec<PalletMetadataV14>,
		palletId: string
	): {
		isValidPalletName: boolean;
		isValidPalletIndex: boolean;
		parsedPalletId: string | number;
	} {
		// Either a pallet name (string) or a pallet index (number)
		const parsedPalletId = PalletsErrorService.palletIdxOrName(palletId);

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
