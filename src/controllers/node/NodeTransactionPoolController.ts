import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { NodeTransactionPoolService } from '../../services';
import AbstractController from '../AbstractController';

export default class NodeTransactionPoolController extends AbstractController<
	NodeTransactionPoolService
> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/node/transaction-pool',
			new NodeTransactionPoolService(api)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeTransactionPool]]);
	}

	/**
	 * Get the transaction pool of the node.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getNodeTransactionPool: RequestHandler = async (
		_req,
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		NodeTransactionPoolController.sanitizedSend(
			res,
			await this.service.fetchNodeTransactionPool(hash)
		);
	};
}
