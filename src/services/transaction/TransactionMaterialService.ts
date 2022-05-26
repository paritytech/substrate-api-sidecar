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
import { ITransactionMaterial } from 'src/types/responses';

import { MetadataOpts } from '../../controllers/transaction/TransactionMaterialController';
import { AbstractService } from '../AbstractService';

export class TransactionMaterialService extends AbstractService {
	/**
	 * Fetch all the network information needed to construct a transaction offline.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchTransactionMaterial(
		hash: BlockHash,
		metadataArg: MetadataOpts | false
	): Promise<ITransactionMaterial> {
		const { api } = this;

		if (!metadataArg) {
			const [header, genesisHash, name, version] = await Promise.all([
				api.rpc.chain.getHeader(hash),
				api.rpc.chain.getBlockHash(0),
				api.rpc.system.chain(),
				api.rpc.state.getRuntimeVersion(hash),
			]);

			const at = {
				hash,
				height: header.number.toNumber().toString(10),
			};

			return {
				at,
				genesisHash,
				chainName: name.toString(),
				specName: version.specName.toString(),
				specVersion: version.specVersion,
				txVersion: version.transactionVersion,
			};
		}

		const [header, metadata, genesisHash, name, version] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.rpc.state.getMetadata(hash),
			api.rpc.chain.getBlockHash(0),
			api.rpc.system.chain(),
			api.rpc.state.getRuntimeVersion(hash),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		const formattedMeta =
			metadataArg === 'scale' ? metadata.toHex() : metadata.toJSON();

		return {
			at,
			genesisHash,
			chainName: name.toString(),
			specName: version.specName.toString(),
			specVersion: version.specVersion,
			txVersion: version.transactionVersion,
			metadata: formattedMeta,
		};
	}
}
