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

import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';

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

		const [{ number }, foreignAssetInfo, foreignAssetMetaData] =
			await Promise.all([
				api.rpc.chain.getHeader(hash),
				api.query.foreignAssets.asset.entries(),
				api.query.foreignAssets.metadata.entries(),
			]);

		const items: IForeignAssetInfo[] = foreignAssetInfo.map(
			([_, info], index) => {
				return {
					foreignAssetInfo: info,
					foreignAssetMetadata: foreignAssetMetaData[index][1],
					foreignAssetName: foreignAssetMetaData[index][1]['name'].toHuman(),
					foreignAssetSymbol: foreignAssetMetaData[index][1]['symbol'].toHuman(),
				};
			}
		);

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
