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
import { BlockHash, EventMetadataLatest } from '@polkadot/types/interfaces';
import { IsEvent } from '@polkadot/types/metadata/decorate/types';
import { AnyTuple } from '@polkadot/types-codec/types';
import { stringCamelCase } from '@polkadot/util';
import { IPalletEvents, IPalletEventsItem } from 'src/types/responses';

import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchEventItemArgs extends IFetchPalletArgs {
	eventItemId: string;
	metadata: boolean;
}

export class PalletsEventsService extends AbstractPalletsService {
	async fetchEventItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, eventItemId, metadata }: IFetchEventItemArgs,
	): Promise<IPalletEventsItem> {
		const metadataFieldType = 'events';
		const palletMetadata = historicApi.registry.metadata;

		const [palletMeta, palletMetaIdx] = this.findPalletMeta(palletMetadata, palletId, metadataFieldType);

		// Even if `eventItemMetadata` is not used, we call this function to ensure it exists. The side effects
		// of the event item not existing are that `getEventItemMeta` will throw.
		const eventItemMetadata = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			eventItemId,
			metadataFieldType,
		) as EventMetadataLatest;

		let palletEventMetadata: EventMetadataLatest | undefined;
		if (metadata) {
			palletEventMetadata = (eventItemMetadata[1] as IsEvent<AnyTuple>).meta;
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			eventItem: eventItemId,
			metadata: palletEventMetadata,
		};
	}

	async fetchEvents(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletEvents> {
		const metadataFieldType = 'events';
		const metadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(metadata, palletId, metadataFieldType);

		const { number } = await this.api.rpc.chain.getHeader(hash);
		const parsedPalletName = stringCamelCase(palletMeta.name.toString());
		const events = historicApi.events[parsedPalletName];

		let items: [] | EventMetadataLatest[] | Text[];
		if ((palletMeta.events as unknown as EventMetadataLatest).isEmpty) {
			items = [];
		} else if (onlyIds) {
			items = Object.entries(events).map((eventItem) => eventItem[0] as unknown as Text);
		} else {
			items = Object.entries(events).map((eventItem) => eventItem[1].meta);
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
