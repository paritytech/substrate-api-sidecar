// Copyright 2017-2026 Parity Technologies (UK) Ltd.
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
import { RuntimeApisService } from '../../../services';
import { IRuntimeApiCallBody, IRuntimeApiMethodParam, IRuntimeApiParam } from '../../../types/requests';
import AbstractController from '../../AbstractController';

/**
 * Relay chain runtime API discovery and invocation endpoints.
 */
export default class RcRuntimeApisController extends AbstractController<RuntimeApisService> {
	static controllerName = 'RcRuntimeApis';
	static requiredPallets = [];

	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}

		super(rcSpecName, '/rc/runtime/apis', new RuntimeApisService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['', this.getRuntimeApis],
			['/:apiId', this.getRuntimeApi],
		]);

		this.safeMountAsyncPostHandlers([['/:apiId/:methodId', this.callRuntimeApiMethod]]);
	}

	private getRuntimeApis: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const apiAt = at ? await rcApi.at(hash) : rcApi;

		RcRuntimeApisController.sanitizedSend(res, await this.service.fetchRuntimeApis(hash, apiAt));
	};

	private getRuntimeApi: RequestHandler = async ({ params, query: { at } }, res): Promise<void> => {
		const { apiId } = params as IRuntimeApiParam;
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const apiAt = at ? await rcApi.at(hash) : rcApi;

		RcRuntimeApisController.sanitizedSend(res, await this.service.fetchRuntimeApi(hash, apiId, apiAt));
	};

	private callRuntimeApiMethod: RequestHandler = async ({ params, body }, res): Promise<void> => {
		const { apiId, methodId } = params as IRuntimeApiMethodParam;
		const { params: runtimeParams, at } = (body ?? {}) as IRuntimeApiCallBody;
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const apiAt = at ? await rcApi.at(hash) : rcApi;

		RcRuntimeApisController.sanitizedSend(
			res,
			await this.service.callRuntimeApi(hash, apiId, methodId, runtimeParams, apiAt),
		);
	};
}
