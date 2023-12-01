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
import { BlockHash, ErrorMetadataLatest } from '@polkadot/types/interfaces';
import { IsError } from '@polkadot/types/metadata/decorate/types';
import { stringCamelCase } from '@polkadot/util';
import { IPalletErrors, IPalletErrorsItem } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchErrorItemArgs extends IFetchPalletArgs {
	errorItemId: string;
	metadata: boolean;
}

export class PalletsErrorsService extends AbstractPalletsService {
	async fetchErrorItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, errorItemId, metadata }: IFetchErrorItemArgs,
	): Promise<IPalletErrorsItem> {
		const metadataFieldType = 'errors';
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(palletMetadata, palletId, metadataFieldType);

		// Even if `errorItemMetadata` is not used, we call this function to ensure it exists. The side effects
		// of the error item not existing are that `getErrorItemMeta` will throw.
		const errorItemMetadata = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			errorItemId,
			metadataFieldType,
		) as ErrorMetadataLatest;

		let palletErrorMetadata: ErrorMetadataLatest | undefined;
		if (metadata) {
			palletErrorMetadata = (errorItemMetadata[1] as IsError).meta;
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			errorItem: errorItemId,
			metadata: palletErrorMetadata,
		};
	}

	async fetchErrors(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletErrors> {
		const metadataFieldType = 'errors';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(metadata, palletId, metadataFieldType);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const parsedPalletName = stringCamelCase(palletMeta.name.toString());
		const errors = historicApi.errors[parsedPalletName];

		let items: [] | ErrorMetadataLatest[] | Text[];
		if ((palletMeta.errors as unknown as ErrorMetadataLatest).isEmpty) {
			items = [];
		} else if (onlyIds) {
			items = Object.entries(errors).map((errorItem) => errorItem[0] as unknown as Text);
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
}
