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
import { BlockHash, PalletConstantMetadataLatest } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { IPalletConstants, IPalletConstantsItem } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchConstantItemArgs extends IFetchPalletArgs {
	constantItemId: string;
	metadata: boolean;
}

export class PalletsConstantsService extends AbstractPalletsService {
	async fetchConstantItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, constantItemId, metadata }: IFetchConstantItemArgs,
	): Promise<IPalletConstantsItem> {
		const metadataFieldType = 'constants';
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(palletMetadata, palletId, metadataFieldType);

		// Even if `constantItemMetadata` is not used, we call this function to ensure it exists. The side effects
		// of the constant item not existing are that `getConstItemMeta` will throw.
		const constantItemMetadata = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			constantItemId,
			metadataFieldType,
		) as PalletConstantMetadataLatest;

		let palletConstantMetadata: PalletConstantMetadataLatest | undefined;
		if (metadata) {
			palletConstantMetadata = constantItemMetadata;
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			constantsItem: constantItemId,
			metadata: palletConstantMetadata,
		};
	}

	async fetchConstants(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletConstants> {
		const metadataFieldType = 'constants';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(metadata, palletId, metadataFieldType);

		const { number } = await this.api.rpc.chain.getHeader(hash);

		let items: [] | PalletConstantMetadataLatest[] | Text[];
		if (palletMeta.constants.isEmpty) {
			items = [];
		} else if (onlyIds) {
			items = palletMeta.constants.map((itemMeta) => itemMeta.name);
		} else {
			items = palletMeta.constants.map((itemMeta) => itemMeta as PalletConstantMetadataLatest);
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
