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

import type { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { IRuntimeSpec } from 'src/types/responses';

import { AbstractService } from '../../AbstractService';

export class RcRuntimeSpecService extends AbstractService {
	/**
	 * Fetch runtime specification from the relay chain at a given block.
	 *
	 * @param hash `BlockHash` to make call at.
	 * @param api Relay chain API instance.
	 */
	async fetchSpec(hash: BlockHash, api: ApiPromise): Promise<IRuntimeSpec> {
		const [
			{ authoringVersion, specName, specVersion, transactionVersion, implVersion },
			chainType,
			properties,
			{ number },
		] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.system.chainType(),
			api.rpc.system.properties(),
			api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				height: number.unwrap().toString(10),
				hash,
			},
			authoringVersion,
			transactionVersion,
			implVersion,
			specName,
			specVersion,
			chainType,
			properties,
		};
	}
}
