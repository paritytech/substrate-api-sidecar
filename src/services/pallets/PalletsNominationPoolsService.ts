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

import {
	IPalletNominationPool,
	IPalletNominationPoolInfo,
} from '../../types/responses/';
import { AbstractService } from '../AbstractService';

export class PalletsNominationPoolService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch a nomination pool's details with its `poolId`.
	 *
	 * @param poolId `poolId` used to get info and metadata for an asset
	 * @param hash `BlockHash` to make call at
	 * @param getMetaData `getMetaData` used to determine if metadata is included in call
	 */

	async fetchNominationPoolById(
		poolId: number,
		hash: BlockHash,
		getMetaData: boolean,
	): Promise<IPalletNominationPool> {
		const { api } = this;
		const historicApi = await api.at(hash);
		let metadata = '';

		const [{ number }, bondedPool, rewardPool] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.nominationPools.bondedPools(poolId),
			historicApi.query.nominationPools.rewardPools(poolId),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		// get metadata if user requested
		if (getMetaData) {
			const data = await api.query.nominationPools.metadata(poolId);
			metadata = data.toString();
		}

		const response = getMetaData ?
		 {
			at,
			bondedPool,
			rewardPool,
			metadata,
		 }
		 : 
		 {
			at,
			bondedPool,
			rewardPool,
		 };

		return response;
	}


	/**
	 * Fetch info on nomination pools.
	 *
	 * @param hash `BlockHash` to make call at
	 */

	async fetchNominationPoolInfo(
		hash: BlockHash,
	): Promise<IPalletNominationPoolInfo> {
		const { api } = this;
		const historicApi = await api.at(hash);

		const [
			{ number },
			counterForBondedPools,
			counterForMetadata,
			counterForPoolMembers,
			counterForReversePoolIdLookup,
			counterForRewardPools,
			counterForSubPoolsStorage,
			lastPoolId,
			maxPoolMembers,
			maxPoolMembersPerPool,
			maxPools,
			minCreateBond,
			minJoinBond,
		] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.nominationPools.counterForBondedPools(),
			historicApi.query.nominationPools.counterForMetadata(),
			historicApi.query.nominationPools.counterForPoolMembers(),
			historicApi.query.nominationPools.counterForReversePoolIdLookup(),
			historicApi.query.nominationPools.counterForRewardPools(),
			historicApi.query.nominationPools.counterForSubPoolsStorage(),
			historicApi.query.nominationPools.lastPoolId(),
			historicApi.query.nominationPools.maxPoolMembers(),
			historicApi.query.nominationPools.maxPoolMembersPerPool(),
			historicApi.query.nominationPools.maxPools(),
			historicApi.query.nominationPools.minCreateBond(),
			historicApi.query.nominationPools.minJoinBond(),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			counterForBondedPools,
			counterForMetadata,
			counterForPoolMembers,
			counterForReversePoolIdLookup,
			counterForRewardPools,
			counterForSubPoolsStorage,
			lastPoolId,
			maxPoolMembers,
			maxPoolMembersPerPool,
			maxPools,
			minCreateBond,
			minJoinBond,
		};
	}
}
