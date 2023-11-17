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

import { BlockHash } from '@polkadot/types/interfaces';
import { IRuntimeSpec } from 'src/types/responses';

import { AbstractService } from '../AbstractService';
export class RuntimeSpecService extends AbstractService {
	async fetchSpec(hash: BlockHash): Promise<IRuntimeSpec> {
		const [
			{ authoringVersion, specName, specVersion, transactionVersion, implVersion },
			chainType,
			properties,
			{ number },
		] = await Promise.all([
			this.api.rpc.state.getRuntimeVersion(hash),
			this.api.rpc.system.chainType(),
			this.api.rpc.system.properties(),
			this.api.rpc.chain.getHeader(hash),
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
