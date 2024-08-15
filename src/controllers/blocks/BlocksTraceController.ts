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
import { RequestHandler } from 'express-serve-static-core';

import { validateBoolean } from '../../middleware';
import { BlocksTraceService } from '../../services';
import AbstractController from '../AbstractController';
import BlocksController from './BlocksController';

export default class BlocksTraceController extends AbstractController<BlocksTraceService> {
	constructor(api: ApiPromise) {
		super(api, '/experimental/blocks', new BlocksTraceService(api));
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
		const hash = await this.api.rpc.chain.getFinalizedHead();

		BlocksController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getBlockTraces: RequestHandler = async ({ params: { number } }, res): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		BlocksController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getLatestBlockOperations: RequestHandler = async ({ query: { actions } }, res): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();
		const includeActions = actions === 'true';
		const historicApi = await this.api.at(hash);

		BlocksController.sanitizedSend(res, await this.service.operations(hash, historicApi, includeActions));
	};

	private getBlockOperations: RequestHandler = async (
		{ params: { number }, query: { actions } },
		res,
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);
		const includeActions = actions === 'true';
		const historicApi = await this.api.at(hash);

		BlocksController.sanitizedSend(res, await this.service.operations(hash, historicApi, includeActions));
	};
}
