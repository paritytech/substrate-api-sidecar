// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { Option } from '@polkadot/types';
import { AssetMetadata, BlockHash } from '@polkadot/types/interfaces';
import { PalletAssetsAssetDetails, StagingXcmV3MultiLocation } from '@polkadot/types/lookup';
import { AnyJson } from '@polkadot/types-codec/types';
import { isHex } from '@polkadot/util';

import { IForeignAssetInfo, IForeignAssets } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsForeignAssetsService extends AbstractService {
	constructor(api: string) {
		super(api);
	}

	/**
	 * Fetch all foreign asset's `AssetDetails` and `AssetMetadata`.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchForeignAssets(hash: BlockHash): Promise<IForeignAssets> {
		const api = await this.api();

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
		 * https://github.com/paritytech/asset-transfer-api-registry/blob/main/src/fetchSystemParachainForeignAssetInfo.ts#L25L36
		 */
		for (const [assetStorageKeyData, assetInfo] of foreignAssetInfo) {
			let foreignAssetData: [StagingXcmV3MultiLocation] | string = '';
			if (isHex(assetStorageKeyData)) {
				foreignAssetData = assetStorageKeyData;
			} else {
				foreignAssetData = assetStorageKeyData.toHuman() as unknown as [StagingXcmV3MultiLocation];
			}

			let multiLocation: string | AnyJson = '';
			if (foreignAssetData) {
				let assetMetadata: AssetMetadata | {};
				// Checking if the foreign asset data is an array or not because there is a case that the
				// Multilocation is given as a hexadecimal value (see foreign assets in Westend Asset Hub).
				if (Array.isArray(foreignAssetData)) {
					multiLocation = foreignAssetData[0] as unknown as AnyJson;
					// remove any commas from multilocation key values e.g. Parachain: 2,125 -> Parachain: 2125
					const MultiLocationStr = JSON.stringify(foreignAssetData[0]).replace(/(\d),/g, '$1');

					assetMetadata = await api.query.foreignAssets.metadata<AssetMetadata>(JSON.parse(MultiLocationStr));
				} else {
					multiLocation = foreignAssetData;
					assetMetadata = {};
				}

				if (assetInfo.isSome) {
					items.push({
						multiLocation,
						foreignAssetInfo: assetInfo.unwrap(),
						foreignAssetMetadata: assetMetadata,
					});
				} else {
					items.push({
						multiLocation,
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
