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

// import { ApiDecoration, ApiTypes, AugmentedCall } from '@polkadot/api/types';
import { ApiDecoration, SubmittableExtrinsicFunction, ApiTypes } from '@polkadot/api/types';
import { Text } from '@polkadot/types';

import {
	BlockHash,
    // PalletCallMetadataV14,
} from '@polkadot/types/interfaces';
// import { IsError } from '@polkadot/types/metadata/decorate/types';
import { stringCamelCase } from '@polkadot/util';
// import { IPalletCalls, IPalletCallsItem } from 'src/types/responses';
import { IPalletDispatchables } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

// interface IFetchCallItemArgs extends IFetchPalletArgs {
// 	callItemId: string;
// 	metadata: boolean;
// }

export class PalletsDispatchablesService extends AbstractPalletsService {
    async fetchDispatchables(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean }
	): Promise<IPalletDispatchables> {
		const metadataFieldType = 'calls';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			metadata,
			historicApi,
			palletId,
			metadataFieldType
		);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const parsedPalletName = stringCamelCase(palletMeta.name.toString());
		
		console.log("parsed pallet name", parsedPalletName);
		const dispatchables = this.api.tx[parsedPalletName];

		console.log("dispatchables---", dispatchables);

		let items: [] | SubmittableExtrinsicFunction<ApiTypes>[] | Text[];
		if (Object.entries(dispatchables).length === 0) {
			items = [];
		} else if (onlyIds) {
			items = Object.entries(dispatchables).map((txItem) => txItem[0] as unknown as Text)
			for (const [idx, val] of Object.entries(dispatchables)) {
				console.log(`idx ${idx}`);
				console.log(`val ${val}`)
			}
		} else {
			items = [] as SubmittableExtrinsicFunction<ApiTypes>[];
			for (const [, value] of Object.entries(dispatchables)) {
				const item = value
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