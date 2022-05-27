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
 * 		- `tip`: Tip included into the extrinsic. Available when the `tip` query param is set to true.
 */
export default class NodeTransactionPoolController extends AbstractController<NodeTransactionPoolService> {
	constructor(api: ApiPromise) {
		super(api, '/node/transaction-pool', new NodeTransactionPoolService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeTransactionPool]]);
	}

	/**
	 * GET pending extrinsics from the Substrate node.
	 *
	 * @param req Express Request, accepts the query param `tip`
	 * @param res Express Response
	 */
	private getNodeTransactionPool: RequestHandler = async (
		{ query: { totalFee } },
		res
	): Promise<void> => {
		const includeFee = totalFee === 'true';

		NodeTransactionPoolController.sanitizedSend(
			res,
			await this.service.fetchTransactionPool(includeFee)
		);
	};
}
