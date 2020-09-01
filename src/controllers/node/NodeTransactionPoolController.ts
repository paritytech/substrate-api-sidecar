import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { NodeTransactionPoolService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET pending extrinsics from the Substrate node.
 *
 * Returns:
 * - `pool`: array of
 * 		- `hash`: H256 hash of the extrinsic.
 * 		- `encodedExtrinsic`: Scale encoded extrinsic.
 */
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
	 ** GET pending extrinsics from the Substrate node.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getNodeTransactionPool: RequestHandler = async (
		_req,
		res
	): Promise<void> => {
		NodeTransactionPoolController.sanitizedSend(
			res,
			await this.service.fetchTransactionPool()
		);
	};
}
