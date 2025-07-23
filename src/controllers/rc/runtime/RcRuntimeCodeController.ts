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

import { RequestHandler } from 'express';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { RuntimeCodeService } from '../../../services';
import AbstractController from '../../AbstractController';

/**
 * Get the Wasm code blob of the relay chain Substrate runtime.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `code`: Runtime code Wasm blob.
 */
export default class RcRuntimeCodeController extends AbstractController<RuntimeCodeService> {
	static controllerName = 'RcRuntimeCode';
	static requiredPallets = [];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/runtime/code', new RuntimeCodeService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getCodeAtBlock]]);
	}

	/**
	 * Get the relay chain's runtime code in Wasm format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */

	private getCodeAtBlock: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });

		RcRuntimeCodeController.sanitizedSend(res, await this.service.fetchCode(hash));
	};
}
