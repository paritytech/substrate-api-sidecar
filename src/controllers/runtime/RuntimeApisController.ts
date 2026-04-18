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

import { RuntimeApisService } from '../../services';
import { IRuntimeApiCallBody, IRuntimeApiMethodParam, IRuntimeApiParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * Runtime API discovery and invocation endpoints.
 */
export default class RuntimeApisController extends AbstractController<RuntimeApisService> {
	static controllerName = 'RuntimeApis';
	static requiredPallets = [];

	constructor(api: string) {
		super(api, '/runtime/apis', new RuntimeApisService(api));
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
		const hash = await this.getHashFromAt(at);
		const apiAt = at ? await this.api.at(hash) : this.api;

		RuntimeApisController.sanitizedSend(res, await this.service.fetchRuntimeApis(hash, apiAt));
	};

	private getRuntimeApi: RequestHandler = async ({ params, query: { at } }, res): Promise<void> => {
		const { apiId } = params as IRuntimeApiParam;
		const hash = await this.getHashFromAt(at);
		const apiAt = at ? await this.api.at(hash) : this.api;

		RuntimeApisController.sanitizedSend(res, await this.service.fetchRuntimeApi(hash, apiId, apiAt));
	};

	private callRuntimeApiMethod: RequestHandler = async ({ params, body }, res): Promise<void> => {
		const { apiId, methodId } = params as IRuntimeApiMethodParam;
		const { params: runtimeParams, at } = (body ?? {}) as IRuntimeApiCallBody;
		const hash = await this.getHashFromAt(at);
		const apiAt = at ? await this.api.at(hash) : this.api;

		RuntimeApisController.sanitizedSend(
			res,
			await this.service.callRuntimeApi(hash, apiId, methodId, runtimeParams, apiAt),
		);
	};
}
