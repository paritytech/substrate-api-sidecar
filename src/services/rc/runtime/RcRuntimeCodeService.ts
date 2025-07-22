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
import { Option, Raw } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { IMetadataCode } from 'src/types/responses';

import { AbstractService } from '../../AbstractService';

// https://github.com/shawntabrizi/substrate-graph-benchmarks/blob/ae9b82f/js/extensions/known-keys.js#L21
const RC_CODE_KEY = '0x3a636f6465';

export class RcRuntimeCodeService extends AbstractService {
	/**
	 * Fetch relay chain runtime code in Wasm format.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param api Relay chain API instance.
	 */
	async fetchCode(hash: BlockHash, api: ApiPromise): Promise<IMetadataCode> {
		const [code, { number }] = await Promise.all([
			api.rpc.state.getStorage(RC_CODE_KEY, hash),
			api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash,
				height: number.unwrap().toString(10),
			},
			code: code as Option<Raw>,
		};
	}
}
