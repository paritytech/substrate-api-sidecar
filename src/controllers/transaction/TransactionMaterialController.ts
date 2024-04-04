// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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
import { u32, Vec } from '@polkadot/types';
import { RequestHandler } from 'express';

import { TransactionMaterialService } from '../../services';
import AbstractController from '../AbstractController';

export type MetadataOpts = 'json' | 'scale';

/**
 * GET all the network information needed to construct a transaction offline.
 *
 * Path params:
 * - (Optional) `metadataVersion`: The specific version of the Metadata to query.
 *  The input must conform to the `vX` format, where `X` represents the version number (examples: 'v14', 'v15').
 *
 * Query
 * - (Optional) `metadata`: It accepts `json`, or `scale` values. If it is not present,
 *   the metadata field will not be included.
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
		this.safeMountAsyncGetHandlers([
			['/', this.getTransactionMaterial],
			['/:metadataVersion', this.getTransactionMaterialwithVersionedMetadata],
		]);
	}

	/**
	 * GET all the network information needed to construct a transaction offline.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getTransactionMaterial: RequestHandler = async ({ query: { at, metadata } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const metadataArg = this.parseMetadataArgs(metadata);

		TransactionMaterialController.sanitizedSend(res, await this.service.fetchTransactionMaterial(hash, metadataArg));
	};

	/**
	 * The metadata args have two options. `json`, and `scale`.
	 *
	 * @param metadata
	 */
	private parseMetadataArgs(metadata: unknown): MetadataOpts | false {
		/**
		 * Checks to see if the `metadata` query param is inputted.
		 */
		if (metadata) {
			switch (metadata) {
				case 'json':
					return 'json';
				case 'scale':
					return 'scale';
				default:
					throw new Error('Invalid inputted value for the `metadata` query param. Options are `scale` or `json`.');
			}
		}

		return false;
	}

	/**
	 * Get the chain's metadata at the requested version in JSON or scale format
	 * depending on the `metadata` query param.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getTransactionMaterialwithVersionedMetadata: RequestHandler = async (
		{ params: { metadataVersion }, query: { at, metadata } },
		res,
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const api = at ? await this.api.at(hash) : this.api;

		// Validation of the `metadataVersion` path parameter.
		const metadataV = metadataVersion.slice(1);
		const version = this.parseNumberOrThrow(
			metadataV,
			`Version ${metadataV.toString()} of metadata provided is not a number.`,
		);

		const regExPattern = new RegExp('^[vV][0-9]+$');
		if (!regExPattern.test(metadataVersion)) {
			throw new Error(
				`${metadataVersion} input is not of the expected 'vX' format, where 'X' represents the version number (examples: 'v14', 'v15').`,
			);
		}

		let availableVersions = [];
		try {
			availableVersions = (await api.call.metadata.metadataVersions()).toJSON() as unknown as Vec<u32>;
		} catch {
			throw new Error(`Function 'api.call.metadata.metadataVersions()' is not available at this block height.`);
		}
		if (version && !availableVersions?.includes(version as unknown as u32)) {
			throw new Error(`Version ${version} of Metadata is not available.`);
		}

		const metadataArg = this.parseMetadataArgs(metadata);

		TransactionMaterialController.sanitizedSend(
			res,
			await this.service.fetchTransactionMaterialwithVersionedMetadata(api, hash, metadataArg, version),
		);
	};
}
