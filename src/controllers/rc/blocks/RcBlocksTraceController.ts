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

import { RequestHandler } from 'express-serve-static-core';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { validateBoolean } from '../../../middleware';
import { BlocksTraceService } from '../../../services';
import AbstractController from '../../AbstractController';

export default class RcBlocksTraceController extends AbstractController<BlocksTraceService> {
	static controllerName = 'RcBlocksTrace';
	static requiredPallets = [];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/experimental/rc/blocks', new BlocksTraceService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateBoolean(['actions']));
		this.safeMountAsyncGetHandlers([
			['/head/traces', this.getLatestBlockTraces],
			['/:number/traces', this.getBlockTraces],
			['/:number/traces/operations', this.getBlockOperations],
			['/head/traces/operations', this.getLatestBlockOperations],
		]);
	}

	private getLatestBlockTraces: RequestHandler = async (_req, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await rcApi.rpc.chain.getFinalizedHead();

		RcBlocksTraceController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getBlockTraces: RequestHandler = async ({ params: { number } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(number, { api: rcApi });

		RcBlocksTraceController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getLatestBlockOperations: RequestHandler = async ({ query: { actions } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await rcApi.rpc.chain.getFinalizedHead();
		const includeActions = actions === 'true';
		const historicApi = await rcApi.at(hash);

		RcBlocksTraceController.sanitizedSend(res, await this.service.operations(hash, historicApi, includeActions));
	};

	private getBlockOperations: RequestHandler = async (
		{ params: { number }, query: { actions } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(number, { api: rcApi });
		const includeActions = actions === 'true';
		const historicApi = await rcApi.at(hash);

		RcBlocksTraceController.sanitizedSend(res, await this.service.operations(hash, historicApi, includeActions));
	};
}
