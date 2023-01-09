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
import { Text } from '@polkadot/types';
import {
	BlockHash,
	ErrorMetadataLatest,
	ModuleMetadataV13,
	PalletErrorMetadataV14,
	PalletMetadataV14,
} from '@polkadot/types/interfaces';
import { IsError } from '@polkadot/types/metadata/decorate/types';
import { stringCamelCase } from '@polkadot/util';
import { InternalServerError } from 'http-errors';
import {
	IPalletErrors,
	IPalletErrorsItem,
} from 'src/types/responses';

import { PalletsService } from './PalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchErrorItemArgs extends IFetchPalletArgs {
	errorItemId: string;
	metadata: boolean;
}

export class PalletsErrorService extends PalletsService {
	async fetchErrorItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, errorItemId, metadata }: IFetchErrorItemArgs
	): Promise<IPalletErrorsItem> {
		const palletType = 'errors';
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			palletMetadata,
			historicApi,
			palletId,
			palletType
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

		// let normalizedErrorItemMeta;
		// if (metadata) {
		// 	normalizedErrorItemMeta = this.normalizeErrorItemMeta(
		// 		(errorItemMetadata[1] as IsError).meta
		// 	);
		// }
		let palletErrorMetadata; 
		if (metadata) {
			palletErrorMetadata = (errorItemMetadata[1] as IsError).meta
		}

		console.log("pallet error metadata---", palletErrorMetadata);

		const { number } = await this.api.rpc.chain.getHeader(hash);
	
		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			errorItem: errorItemId,
			metadata: palletErrorMetadata
		};
	}

	async fetchErrors(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean }
	): Promise<IPalletErrors> {
		const palletType = 'errors';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			metadata,
			historicApi,
			palletId,
			palletType
		);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const errors = historicApi.errors[palletMeta.name.toString().toLowerCase()];

		let items: [] | ErrorMetadataLatest[] | Text[];
		if ((palletMeta.errors as unknown as PalletErrorMetadataV14).isEmpty) {
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
	 * Find the error item's metadata within the pallets's metadata.
	 *
	 * @param palletMeta the metadata of the pallet that contains the error item
	 * @param errorId name of the error item in camel or pascal case
	 */
	private findErrorItemMeta(
		palletMeta: PalletMetadataV14 | ModuleMetadataV13,
		errorItemId: string,
		errors: ModuleErrors<'promise'>
	): PalletErrorMetadataV14 {
		if ((palletMeta.errors as unknown as PalletErrorMetadataV14).isEmpty) {
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
}
