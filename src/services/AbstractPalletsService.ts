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
import { Option, Vec } from '@polkadot/types';
import {
	ErrorMetadataLatest,
	EventMetadataLatest,
	FunctionMetadataLatest,
	MetadataV14,
	MetadataV15,
	PalletCallMetadataV14,
	PalletConstantMetadataLatest,
	PalletConstantMetadataV14,
	PalletErrorMetadataV14,
	PalletEventMetadataV14,
	PalletMetadataV14,
	PalletMetadataV15,
	PalletStorageMetadataV14,
	StorageEntryMetadataV14,
} from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { BadRequest } from 'http-errors';
import { InternalServerError } from 'http-errors';

import { AbstractService } from './AbstractService';

type IPalletMetadata =
	| Option<PalletStorageMetadataV14>
	| Option<PalletCallMetadataV14>
	| Option<PalletErrorMetadataV14>
	| Option<PalletEventMetadataV14>
	| Vec<PalletConstantMetadataV14>;

type IPalletFieldMeta =
	| ErrorMetadataLatest
	| EventMetadataLatest
	| FunctionMetadataLatest
	| PalletConstantMetadataLatest
	| StorageEntryMetadataV14;

type IMetadataFieldType = 'calls' | 'constants' | 'events' | 'storage' | 'errors';

export abstract class AbstractPalletsService extends AbstractService {
	private getPalletMetadataType(
		meta: PalletMetadataV14 | PalletMetadataV15,
		metadataFieldType: IMetadataFieldType,
	): IPalletMetadata {
		return this.getProperty(meta, metadataFieldType);
	}

	private getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
		return obj[key];
	}

	/**
	 * Find a pallet's metadata info.
	 *
	 * @param palletId identifier for a FRAME pallet as a pallet name or index.
	 */
	protected findPalletMeta(
		adjustedMetadata: MetadataV14 | MetadataV15,
		palletId: string,
		metadataFieldType: IMetadataFieldType,
	): [PalletMetadataV14 | PalletMetadataV15, number] {
		const pallets: Vec<PalletMetadataV14> | Vec<PalletMetadataV15> = adjustedMetadata['pallets'];
		const palletMetaType = this.getPalletMetadataType(pallets[0], metadataFieldType);

		const filtered: (PalletMetadataV14 | PalletMetadataV15)[] = pallets.filter(
			(mod) => !(mod[metadataFieldType] as typeof palletMetaType).isEmpty,
		);

		const { isValidPalletName, isValidPalletIndex, parsedPalletId } = this.validPalletId(pallets, palletId);

		let palletMeta: PalletMetadataV14 | PalletMetadataV15 | undefined;
		let palletIdx: number | undefined;

		if (isValidPalletIndex) {
			palletIdx = parsedPalletId as number;
			for (const [sectionIdx, section] of filtered.entries()) {
				const idx = section.index.eqn(255) ? sectionIdx : section.index.toNumber();

				if (idx === palletIdx) {
					palletMeta = section;
					break;
				}
			}
		} else if (isValidPalletName) {
			for (const [sectionIdx, section] of filtered.entries()) {
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
					palletIdx = section.index.eqn(255) ? sectionIdx : section.index.toNumber();
					palletMeta = section;
					break;
				}
			}
		}

		if (isValidPalletIndex === false && isValidPalletName === false) {
			throw new BadRequest(`"${palletId}" was not recognized as a queryable pallet.`);
		} else if (!palletMeta || palletIdx === undefined || palletIdx < 0) {
			throw new BadRequest(`no queryable ${metadataFieldType} items found for palletId "${palletId}"`);
		}

		return [palletMeta, palletIdx];
	}

	private validPalletId(
		modules: Vec<PalletMetadataV14> | Vec<PalletMetadataV15>,
		palletId: string,
	): {
		isValidPalletName: boolean;
		isValidPalletIndex: boolean;
		parsedPalletId: string | number;
	} {
		// Either a pallet name (string) or a pallet index (number)
		const parsedPalletId = AbstractPalletsService.palletIdxOrName(palletId);

		const isValidPalletName =
			typeof parsedPalletId === 'string' &&
			modules.some((meta) => meta.name.toString().toLowerCase() === palletId.toLowerCase());

		const isValidPalletIndex =
			typeof parsedPalletId === 'number' &&
			modules.some((meta, idx) => (meta.index.eqn(255) ? idx === parsedPalletId : meta.index.eqn(parsedPalletId)));

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

	/**
	 * Find the an item's metadata within a given pallets' metadata based on a provided type.
	 *
	 * @param historicApi Decorated historic api
	 * @param palletMeta the metadata of the pallet that contains the error item
	 * @param palletItemId name of the error item in camel or pascal case
	 * @param metadataFieldType name of the metadata field to be queried
	 *
	 */
	protected findPalletFieldItemMeta(
		historicApi: ApiDecoration<'promise'>,
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		palletItemId: string,
		metadataFieldType: IMetadataFieldType,
	): IPalletFieldMeta {
		let palletItemIdx = -1;
		let palletItemMeta: IPalletFieldMeta;

		if (metadataFieldType === 'storage') {
			[palletItemIdx, palletItemMeta] = this.getStorageItemMeta(palletMeta, palletItemIdx, palletItemId);
		} else if (metadataFieldType === 'errors') {
			[palletItemIdx, palletItemMeta] = this.getErrorItemMeta(historicApi, palletMeta, palletItemIdx, palletItemId);
		} else if (metadataFieldType === 'events') {
			[palletItemIdx, palletItemMeta] = this.getEventItemMeta(historicApi, palletMeta, palletItemIdx, palletItemId);
		} else if (metadataFieldType === 'calls') {
			[palletItemIdx, palletItemMeta] = this.getDispatchablesItemMeta(palletMeta, palletItemIdx, palletItemId);
		} else {
			[palletItemIdx, palletItemMeta] = this.getConstItemMeta(palletMeta, palletItemIdx, palletItemId);
		}

		if (palletItemIdx === -1) {
			throw new InternalServerError(
				`Could not find ${metadataFieldType} item ("${palletItemId}") in metadata. ${metadataFieldType} item names are expected to be in camel case, e.g. 'storageItemId'`,
			);
		}

		return palletItemMeta;
	}

	private getDispatchablesItemMeta(
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		dispatchableItemMetaIdx: number,
		dispatchableItemId: string,
	): [number, FunctionMetadataLatest] {
		const palletName = stringCamelCase(palletMeta.name);
		const dispatchables = this.api.tx[palletName];

		if ((palletMeta.calls as unknown as PalletMetadataV14 | PalletMetadataV15).isEmpty) {
			throw new InternalServerError(`No dispatchable items found in ${palletMeta.name.toString()}'s metadata`);
		}

		for (const [, val] of Object.entries(dispatchables)) {
			const item = val.meta;
			if (stringCamelCase(item.name).toLowerCase() === dispatchableItemId.toLowerCase()) {
				dispatchableItemMetaIdx = val.meta.index.toNumber();
				break;
			}
		}

		return [
			dispatchableItemMetaIdx,
			Object.entries(dispatchables)[dispatchableItemMetaIdx] as unknown as FunctionMetadataLatest,
		];
	}

	private getConstItemMeta(
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		constItemMetaIdx: number,
		constItemId: string,
	): [number, PalletConstantMetadataLatest] {
		if (palletMeta.constants.isEmpty) {
			throw new InternalServerError(`No const items found in ${palletMeta.name.toString()}'s metadata`);
		}
		const palletMetaConsts = palletMeta.constants as Vec<PalletConstantMetadataLatest>;
		constItemMetaIdx = palletMetaConsts.findIndex((item) => item.name.toLowerCase() === constItemId.toLowerCase());

		return [constItemMetaIdx, palletMetaConsts[constItemMetaIdx]];
	}

	private getErrorItemMeta(
		historicApi: ApiDecoration<'promise'>,
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		errorItemMetaIdx: number,
		errorItemId: string,
	): [number, ErrorMetadataLatest] {
		const palletName = stringCamelCase(palletMeta.name);
		const errors = historicApi.errors[palletName];

		if ((palletMeta.errors as unknown as ErrorMetadataLatest).isEmpty) {
			throw new InternalServerError(`No error items found in ${palletMeta.name.toString()}'s metadata`);
		}

		for (const [, val] of Object.entries(errors)) {
			const item = val.meta;
			if (item.name.toLowerCase() === errorItemId.toLowerCase()) {
				errorItemMetaIdx = val.meta.index.toNumber();
				break;
			}
		}

		return [errorItemMetaIdx, Object.entries(errors)[errorItemMetaIdx] as unknown as ErrorMetadataLatest];
	}

	private getEventItemMeta(
		historicApi: ApiDecoration<'promise'>,
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		eventItemMetaIdx: number,
		eventItemId: string,
	): [number, EventMetadataLatest] {
		const palletName = stringCamelCase(palletMeta.name);
		const events = historicApi.events[palletName];

		if ((palletMeta.events as unknown as EventMetadataLatest).isEmpty) {
			throw new InternalServerError(`No event items found in ${palletMeta.name.toString()}'s metadata`);
		}

		for (const [, val] of Object.entries(events)) {
			const item = val.meta;
			if (item.name.toLowerCase() === eventItemId.toLowerCase()) {
				eventItemMetaIdx = val.meta.index.toNumber();
				break;
			}
		}

		return [eventItemMetaIdx, Object.entries(events)[eventItemMetaIdx] as unknown as EventMetadataLatest];
	}

	private getStorageItemMeta(
		palletMeta: PalletMetadataV14 | PalletMetadataV15,
		storageItemMetaIdx: number,
		storageItemId: string,
	): [number, StorageEntryMetadataV14] {
		if (palletMeta.storage.isNone) {
			throw new InternalServerError(`No storage items found in ${palletMeta.name.toString()}'s metadata`);
		}
		const palletMetaStorage = palletMeta.storage.unwrap().items;
		storageItemMetaIdx = palletMetaStorage.findIndex((item) => item.name.toLowerCase() === storageItemId.toLowerCase());

		return [storageItemMetaIdx, palletMetaStorage[storageItemMetaIdx]];
	}
}
