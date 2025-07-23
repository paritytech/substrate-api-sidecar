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

import { u32, Vec } from '@polkadot/types';
import { RequestHandler } from 'express';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { RuntimeMetadataService } from '../../../services';
import AbstractController from '../../AbstractController';

/**
 * GET the relay chain's metadata.
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
export default class RcRuntimeMetadataController extends AbstractController<RuntimeMetadataService> {
	static controllerName = 'RcRuntimeMetadata';
	static requiredPallets = [];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/runtime/metadata', new RuntimeMetadataService(rcSpecName));
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
	 * Get the relay chain's latest metadata in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadata: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		let historicApi;
		if (at) {
			historicApi = await rcApi.at(hash);
		}

		const registry = historicApi ? historicApi.registry : rcApi.registry;
		const metadata = await this.service.fetchMetadata(hash);

		RcRuntimeMetadataController.sanitizedSend(res, metadata, {
			metadataOpts: { registry, version: metadata.version },
		});
	};

	/**
	 * Get the relay chain's metadata at a specific version in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadataVersioned: RequestHandler = async (
		{ params: { metadataVersion }, query: { at } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });

		const api = at ? await rcApi.at(hash) : rcApi;

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
			availableVersions = (await rcApi.call.metadata.metadataVersions()).toJSON() as unknown as Vec<u32>;
		} catch {
			throw new Error(`Function 'api.call.metadata.metadataVersions()' is not available at this block height.`);
		}
		if (version && !availableVersions?.includes(version as unknown as u32)) {
			throw new Error(`Version ${version} of Metadata is not available.`);
		}

		const registry = rcApi.registry;
		const metadata = await this.service.fetchMetadataVersioned(api, version);

		RcRuntimeMetadataController.sanitizedSend(res, metadata, {
			metadataOpts: { registry, version },
		});
	};

	/**
	 * Get the available versions of relay chain's metadata.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadataAvailableVersions: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });

		const metadataVersions = await this.service.fetchMetadataVersions(hash);

		RcRuntimeMetadataController.sanitizedSend(res, metadataVersions, {});
	};
}
