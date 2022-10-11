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
import { ApiDecoration } from '@polkadot/api/types';
import { BlockHash } from '@polkadot/types/interfaces';

import { IPalletNominationPool } from '../../types/responses/';
import { AbstractService } from '../AbstractService';

export class PalletsNominationPoolService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch an asset's `AssetDetails` and `AssetMetadata` with its `AssetId`.
	 *
	 * @param poolId `poolId` used to get info and metadata for an asset
	 * @param hash `BlockHash` to make call at
	 */

	// TODO: add optional metadata
	async fetchNominationPoolById(
		poolId: number,
		hash: BlockHash,
		getMetaData: boolean,
        historicApi: ApiDecoration<"promise">
	): Promise<IPalletNominationPool> {
		const { api } = this;
		let metadata = '';


		const [{ number }, bondedPool, rewardPool] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.nominationPools.bondedPools(poolId),
			historicApi.query.nominationPools.rewardPools(poolId),
		]);

		// get metadata if user requested
		if (getMetaData) {
			let data = await api.query.nominationPools.metadata(poolId);
            metadata = data.toString();
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			bondedPool,
			rewardPool,
			metadata,
		};
	}
}