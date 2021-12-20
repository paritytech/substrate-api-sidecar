import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express-serve-static-core';

import { BlocksTraceService } from '../../services';
import AbstractController from '../AbstractController';
import BlocksController from './BlocksController';

export default class BlocksTraceController extends AbstractController<BlocksTraceService> {
	constructor(api: ApiPromise) {
		super(api, '/experimental/blocks', new BlocksTraceService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/head/traces', this.getLatestBlockTraces],
			['/:number/traces', this.getBlockTraces],
			['/:number/traces/operations', this.getBlockOperations],
			['/head/traces/operations', this.getLatestBlockOperations],
		]);
	}

	private getLatestBlockTraces: RequestHandler = async (
		_req,
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		BlocksController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getBlockTraces: RequestHandler = async (
		{ params: { number } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		BlocksController.sanitizedSend(res, await this.service.traces(hash));
	};

	private getLatestBlockOperations: RequestHandler = async (
		{ query: { actions } },
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();
		const includeActions = actions === 'true';
		const historicApi = await this.api.at(hash);

		BlocksController.sanitizedSend(
			res,
			await this.service.operations(hash, historicApi, includeActions)
		);
	};

	private getBlockOperations: RequestHandler = async (
		{ params: { number }, query: { actions } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);
		const includeActions = actions === 'true';
		const historicApi = await this.api.at(hash);

		BlocksController.sanitizedSend(
			res,
			await this.service.operations(hash, historicApi, includeActions)
		);
	};
}
