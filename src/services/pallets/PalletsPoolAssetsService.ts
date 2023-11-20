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

import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';

import { IPoolAssetInfo } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsPoolAssetsService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch a pool asset's `AssetDetails` and `AssetMetadata` with its `AssetId`.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param assetId `AssetId` used to get info and metadata for an asset
	 */
	async fetchPoolAssetById(hash: BlockHash, assetId: number): Promise<IPoolAssetInfo> {
		const { api } = this;

		const [{ number }, poolAssetInfo, poolAssetMetaData] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.poolAssets.asset(assetId),
			api.query.poolAssets.metadata(assetId),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			poolAssetInfo,
			poolAssetMetaData,
		};
	}
}
