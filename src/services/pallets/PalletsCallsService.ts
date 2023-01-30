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
import { ApiDecoration } from '@polkadot/api/types';
import { Text } from '@polkadot/types';
import {
	BlockHash,
	PalletCallMetadataV14,
    // PalletCallMetadataV14,
} from '@polkadot/types/interfaces';
// import { IsError } from '@polkadot/types/metadata/decorate/types';
import { stringCamelCase } from '@polkadot/util';
// import { IPalletCalls, IPalletCallsItem } from 'src/types/responses';
import { IPalletCalls } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

// interface IFetchCallItemArgs extends IFetchPalletArgs {
// 	callItemId: string;
// 	metadata: boolean;
// }

export class PalletsCallsService extends AbstractPalletsService {
    async fetchCalls(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean }
	): Promise<IPalletCalls> {
		const metadataFieldType = 'calls';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(
			metadata,
			historicApi,
			palletId,
			metadataFieldType
		);
        
        if (onlyIds) {
            this.api.consts
            for(const [key, val] of Object.entries(this.api.call.babeApi)) {
                console.log("KEY OF call", key);
                console.log("VAL OF call", val);
            }
    
            console.log("PALLET META CALL DATA", palletMeta.calls.isSome.valueOf());
            for(const val of (palletMeta.calls.unwrap() as PalletCallMetadataV14).values()) {
                console.log("CODEC VAL--", val);
            }
        }
        
		let items: [] | PalletCallMetadataV14[] | Text[];
        items = [];
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
}