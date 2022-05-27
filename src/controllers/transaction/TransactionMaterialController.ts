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
import { RequestHandler } from 'express';

import { Log } from '../../logging/Log';
import { TransactionMaterialService } from '../../services';
import AbstractController from '../AbstractController';

export type MetadataOpts = 'json' | 'scale';

/**
 * GET all the network information needed to construct a transaction offline.
 *
 * Query
 * - (Optional) `noMeta`: If true, does not return metadata hex. This is useful when metadata is not
 * 		needed and response time is a concern. Defaults to false.
 * - (Optional) `at`: Block hash or number at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `genesisHash`: The hash of the chain's genesis block.
 * - `chainName`: The chain's name.
 * - `specName`: The chain's spec.
 * - `specVersion`: The spec version. Always increased in a runtime upgrade.
 * - `txversion`: The transaction version. Common `txVersion` numbers indicate that the
 *   transaction encoding format and method indices are the same. Needed for decoding in an
 *   offline environment. Adding new transactions does not change `txVersion`.
 * - `metadata`: The chain's metadata in hex format.
 *
 * Note: `chainName`, `specName`, and `specVersion` are used to define a type registry with a set
 * of signed extensions and types. For Polkadot and Kusama, `chainName` is not used in defining
 * this registry, but in other Substrate-based chains that re-launch their network without
 * changing the `specName`, the `chainName` would be needed to create the correct registry.
 *
 * Substrate Reference:
 * - `RuntimeVersion`: https://crates.parity.io/sp_version/struct.RuntimeVersion.html
 * - `SignedExtension`: https://crates.parity.io/sp_runtime/traits/trait.SignedExtension.html
 * -  FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
 */
export default class TransactionMaterialController extends AbstractController<TransactionMaterialService> {
	constructor(api: ApiPromise) {
		super(api, '/transaction/material', new TransactionMaterialService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getTransactionMaterial]]);
	}

	/**
	 * GET all the network information needed to construct a transaction offline.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getTransactionMaterial: RequestHandler = async (
		{ query: { noMeta, at, metadata } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const metadataArg = this.parseMetadataArgs(noMeta, metadata);

		TransactionMaterialController.sanitizedSend(
			res,
			await this.service.fetchTransactionMaterial(hash, metadataArg)
		);
	};

	/**
	 * The metadata args have two options. `json`, and `scale`.
	 *
	 * @param noMeta
	 * @param metadata
	 */
	private parseMetadataArgs(
		noMeta: unknown,
		metadata: unknown
	): MetadataOpts | false {
		/**
		 * Checks to see if the `metadata` query param is inputted, if it isnt,
		 * it will default to the old behavior. This is to be removed once after
		 * the `noMeta` query param is fully deprecated.
		 */
		if (metadata) {
			switch (metadata) {
				case 'json':
					return 'json';
				case 'scale':
					return 'scale';
				default:
					throw new Error(
						'Invalid inputted value for the `metadata` query param.'
					);
			}
		}

		if (noMeta) {
			Log.logger.warn(
				'`noMeta` query param will be deprecated in sidecar v13, and replaced with `metadata` please migrate'
			);
			switch (noMeta) {
				case 'true':
					return false;
				case 'false':
					return 'scale';
			}
		}

		// default behavior until `noMeta` is deprecated, then false will be default
		return 'scale';
	}
}
