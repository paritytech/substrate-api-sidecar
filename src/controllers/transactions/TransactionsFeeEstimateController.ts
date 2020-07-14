import { ApiPromise } from '@polkadot/api';

import { TransactionsFeeEstimateService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/request_types';
import AbstractController from '../AbstractController';

/**
 * POST a serialized transaction and receive a fee estimate.
 *
 * Post info:
 * - `data`: Expects a hex-encoded transaction, e.g. '{"tx": "0x..."}'.
 * - `headers`: Expects 'Content-Type: application/json'.
 *
 * Returns:
 * - Success:
 *   - `weight`: Extrinsic weight.
 *   - `class`: Extrinsic class, one of 'Normal', 'Operational', or 'Mandatory'.
 *   - `partialFee`: _Expected_ inclusion fee for the transaction. Note that the fee rate changes
 *     up to 30% in a 24 hour period and this will not be the exact fee.
 * - Failure:
 *   - `error`: Error description.
 *   - `data`: The extrinsic and reference block hash.
 *   - `cause`: Error message from the client.
 *
 * Note: `partialFee` does not include any tips that you may add to increase a transaction's
 * priority. See the reference on `compute_fee`.
 *
 * Substrate Reference:
 * - `RuntimeDispatchInfo`: https://crates.parity.io/pallet_transaction_payment_rpc_runtime_api/struct.RuntimeDispatchInfo.html
 * - `query_info`: https://crates.parity.io/pallet_transaction_payment/struct.Module.html#method.query_info
 * - `compute_fee`: https://crates.parity.io/pallet_transaction_payment/struct.Module.html#method.compute_fee
 */
export default class TransactionsFeeEstimateController extends AbstractController<
	TransactionsFeeEstimateService
> {
	constructor(api: ApiPromise) {
		super(api, '/tx/fee-estimate', new TransactionsFeeEstimateService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, this.catchWrap(this.txFeeEstimate));
	}

	/**
	 * Submit a serialized transaction in order to receive an estimate for its
	 * partial fees.
	 *
	 * @param req Sidecar TxRequest
	 * @param res Express Response
	 */
	private txFeeEstimate: IPostRequestHandler<ITx> = async (
		{ body: { tx } },
		res
	): Promise<void> => {
		if (!tx) {
			throw {
				error: 'Missing field `tx` on request body.',
			};
		}

		const hash = await this.api.rpc.chain.getFinalizedHead();

		TransactionsFeeEstimateController.sanitizedSend(
			res,
			await this.service.fetchTransactionFeeEstimate(hash, tx)
		);
	};
}
