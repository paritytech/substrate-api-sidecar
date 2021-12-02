import { ApiPromise } from '@polkadot/api';

import { TransactionSubmitAndWatchService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class TransactionSubmitAndWatchController extends AbstractController<TransactionSubmitAndWatchService> {
	constructor(api: ApiPromise) {
		super(api, '/transaction/watch', new TransactionSubmitAndWatchService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(
			this.path,
			TransactionSubmitAndWatchController.catchWrap(this.txSubmit)
		);
	}

	/**
	 * Submit a serialized transaction to the transaction queue.
	 *
	 * @param req Sidecar TxRequest
	 * @param res Express Response
	 */
	private txSubmit: IPostRequestHandler<ITx> = async (
		{ body: { tx } },
		res
	): Promise<void> => {
		if (!tx) {
			throw {
				error: 'Missing field `tx` on request body.',
			};
		}

		res.send(await this.service.submitAndWatchTransaction(tx));
	};
}
