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

import { RuntimeMetadataService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET the chain's metadata.
 *
 * Path params:
 * - (Optional) `metadataVersion`: The specific version of the Metadata to query.
 *  The input must conform to the `vX` format, where `X` represents the version number (examples: 'v14', 'v15').
 *
 * Query:
 * - (Optional) `at`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - Metadata object.
 *
 * Substrate Reference:
 * - FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
 * - Knowledge Base: https://substrate.dev/docs/en/knowledgebase/runtime/metadata
 */
export default class RuntimeMetadataController extends AbstractController<RuntimeMetadataService> {
	constructor(api: ApiPromise) {
		super(api, '/runtime/metadata', new RuntimeMetadataService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/', this.getMetadata],
			['/versions', this.getMetadataAvailableVersions],
			['/:metadataVersion', this.getMetadataVersioned],
		]);
	}

	/**
	 * Get the chain's latest metadata in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadata: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		let historicApi;
		if (at) {
			historicApi = await this.api.at(hash);
		}

		const registry = historicApi ? historicApi.registry : this.api.registry;
		const metadata = await this.service.fetchMetadata(hash);

		RuntimeMetadataController.sanitizedSend(res, metadata, {
			metadataOpts: { registry, version: metadata.version },
		});
	};

	/**
	 * Get the chain's metadata at a specific version in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadataVersioned: RequestHandler = async (
		{ params: { metadataVersion }, query: { at } },
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

		const registry = api.registry;
		const metadata = await this.service.fetchMetadataVersioned(api, version);

		RuntimeMetadataController.sanitizedSend(res, metadata, {
			metadataOpts: { registry, version },
		});
	};

	/**
	 * Get the available versions of chain's metadata.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadataAvailableVersions: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const metadataVersions = await this.service.fetchMetadataVersions(hash);

		RuntimeMetadataController.sanitizedSend(res, metadataVersions, {});
	};
}
