// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { AssetMetadata, BlockHash } from '@polkadot/types/interfaces';
import { PalletAssetsAssetDetails } from '@polkadot/types/lookup';

import { IForeignAssetInfo, IForeignAssets } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsForeignAssetsService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch all foreign asset's `AssetDetails` and `AssetMetadata`.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchForeignAssets(hash: BlockHash): Promise<IForeignAssets> {
		const { api } = this;

		const [{ number }, foreignAssetInfo] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.foreignAssets.asset.entries<Option<PalletAssetsAssetDetails>>(),
		]);

		const items: IForeignAssetInfo[] = [];

		/**
		 * This will iterate through all the foreign asset entries and for each entry it will create
		 * the `foreignAssetMultiLocation` variable based on the MultiLocation of the foreign asset.
		 * This variable will then be used as the key to get the corresponding metadata of the foreign asset.
		 *
		 * This is based on the logic implemented by marshacb in asset-transfer-api-registry
		 * https://github.com/paritytech/asset-transfer-api-registry/blob/main/src/createRegistry.ts#L193-L238
		 */
		for (const [assetStorageKeyData, assetInfo] of foreignAssetInfo) {
			const foreignAssetData = assetStorageKeyData.toHuman();

			if (foreignAssetData) {
				// remove any commas from multilocation key values e.g. Parachain: 2,125 -> Parachain: 2125
				const foreignAssetMultiLocationStr = JSON.stringify(foreignAssetData[0]).replace(/(\d),/g, '$1');

				const assetMetadata = await api.query.foreignAssets.metadata<AssetMetadata>(
					JSON.parse(foreignAssetMultiLocationStr),
				);

				if (assetInfo.isSome) {
					items.push({
						foreignAssetInfo: assetInfo.unwrap(),
						foreignAssetMetadata: assetMetadata,
					});
				} else {
					items.push({
						foreignAssetInfo: {},
						foreignAssetMetadata: assetMetadata,
					});
				}
			}
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			items,
		};
	}
}
