import { ApiPromise } from '@polkadot/api';

import ApiHandler from '../ApiHandler';
import { RequestHandlerTx } from '../types/request_types';
import AbstractController from './AbstractController';

/**
 * POST a serialized transaction to submit to the transaction queue.
 *
 * Post info:
 * - `data`: Expects a hex-encoded transaction, e.g. '{"tx": "0x..."}'.
 * - `headers`: Expects 'Content-Type: application/json'.
 *
 * Returns:
 * - Success:
 *   - `hash`: The hash of the encoded transaction.
 * - Failure:
 *   - `error`: 'Failed to parse a tx' or 'Failed to submit a tx'. In the case of the former, the
 *     Sidecar was unable to parse the transaction and never even submitted it to the client. In
 *     the case of the latter, the transaction queue rejected the transaction.
 *   - `data`: The hex-encoded extrinsic. Only present if Sidecar fails to parse a transaction.
 *   - `cause`: The error message from parsing or from the client.
 */
export default class TxSubmitController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/tx');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, this.catchWrap(this.txSubmit));
	}

	/**
	 * Submit a serialized transaction to the transaction queue.
	 *
	 * @param req Sidecar TxRequest
	 * @param res Express Response
	 */
	private txSubmit: RequestHandlerTx = async (req, res): Promise<void> => {
		const { tx } = req.body;
		if (!tx) {
			throw {
				error: 'Missing field `tx` on request body.',
			};
		}

		res.send(await this.handler.submitTx(tx));
	};
}
