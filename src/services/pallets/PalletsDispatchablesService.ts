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

import { ApiDecoration, ApiTypes, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Text } from '@polkadot/types';
import { BlockHash, FunctionMetadataLatest } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { IPalletDispatchableItem, IPalletDispatchables } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchDispatchableItemArgs extends IFetchPalletArgs {
	dispatchableItemId: string;
	metadata: boolean;
}

export class PalletsDispatchablesService extends AbstractPalletsService {
	async fetchDispatchableItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, dispatchableItemId, metadata }: IFetchDispatchableItemArgs,
	): Promise<IPalletDispatchableItem> {
		const metadataFieldType = 'calls';
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(palletMetadata, palletId, metadataFieldType);

		// Even if `dispatchableItemMetadata` is not used, we call this function to ensure it exists. The side effects
		// of the dispatchable item not existing are that `getDispatchablesItemMeta` will throw.
		const dispatchableItemMetadata = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			dispatchableItemId,
			metadataFieldType,
		) as FunctionMetadataLatest;

		let palletDispatchableMetadata: FunctionMetadataLatest | undefined;
		if (metadata) {
			palletDispatchableMetadata = (dispatchableItemMetadata[1] as SubmittableExtrinsicFunction<ApiTypes>).meta;
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			dispatchableItem: dispatchableItemId,
			metadata: palletDispatchableMetadata,
		};
	}

	async fetchDispatchables(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletDispatchables> {
		const metadataFieldType = 'calls';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(metadata, palletId, metadataFieldType);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const parsedPalletName = stringCamelCase(palletMeta.name.toString());
		const dispatchables = this.api.tx[parsedPalletName];

		let items: [] | FunctionMetadataLatest[] | Text[];
		if (Object.entries(dispatchables).length === 0) {
			items = [];
		} else if (onlyIds) {
			items = Object.entries(dispatchables).map((txItem) => txItem[0] as unknown as Text);
		} else {
			items = Object.entries(dispatchables).map((dispatchableItem) => dispatchableItem[1].meta);
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
