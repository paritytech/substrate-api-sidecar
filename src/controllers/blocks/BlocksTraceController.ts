import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express-serve-static-core';

import { BlocksTraceService } from '../../services';
import AbstractController from '../AbstractController';
import BlocksController from './BlocksController';

export default class BlocksTraceController extends AbstractController<BlocksTraceService> {
	constructor(api: ApiPromise) {
		super(api, '/blocks', new BlocksTraceService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['exprimental/head/traces', this.getLatestBlockTraces],
			['experimental/:number/traces', this.getBlockTraces],
			['experimental/:number/traces/operations', this.getBlockOperations],
			['experimental/head/traces/operations', this.getLatestBlockOperations],
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
		_req,
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		BlocksController.sanitizedSend(res, await this.service.operations(hash));
	};

	private getBlockOperations: RequestHandler = async (
		{ params: { number } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		BlocksController.sanitizedSend(res, await this.service.operations(hash));
	};
}
