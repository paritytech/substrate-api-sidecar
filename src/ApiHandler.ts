// Copyright 2017-2020 Parity Technologies (UK) Ltd.
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
import { BlockHash } from '@polkadot/types/interfaces/rpc';

export default class ApiHandler {
	private api: ApiPromise;

	constructor(api: ApiPromise) {
		this.api = api;
	}

	async fetchBlock(hash: BlockHash) {
		const { api } = this;
		const { block } = await api.rpc.chain.getBlock(hash);
		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});
		const extrinsics = block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, args } = extrinsic;

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
			};
		});

		return {
			number,
			hash,
			parentHash,
			stateRoot,
			extrinsicsRoot,
			logs,
			extrinsics,
		};
	}

	async fetchBalance(hash: BlockHash, address: string) {
		const { api } = this;

		const [header, free, reserved, locks] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.freeBalance.at(hash, address),
			api.query.balances.reservedBalance.at(hash, address),
			api.query.balances.locks.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number,
		};

		return { at, free, reserved, locks };
	}
}