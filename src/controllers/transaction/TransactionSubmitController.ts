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

import { TransactionSubmitService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/requests';
import AbstractController from '../AbstractController';

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
 *   - `error`: 'Failed to parse transaction' or 'Failed to submit transaction'. In the case of the former,
 *     Sidecar was unable to parse the transaction and never submitted it to the client. In
 *     the case of the latter, the transaction queue rejected the transaction.
 *   - `extrinsic`: The hex-encoded extrinsic. Only present if Sidecar fails to parse a transaction.
 *   - `cause`: The error message from parsing or from the client.
 */
export default class TransactionSubmitController extends AbstractController<TransactionSubmitService> {
	constructor(api: ApiPromise) {
		super(api, '/transaction', new TransactionSubmitService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, TransactionSubmitController.catchWrap(this.txSubmit));
	}

	/**
	 * Submit a serialized transaction to the transaction queue.
	 *
	 * @param req Sidecar TxRequest
	 * @param res Express Response
	 */
	private txSubmit: IPostRequestHandler<ITx> = async ({ body: { tx } }, res): Promise<void> => {
		if (!tx) {
			throw {
				error: 'Missing field `tx` on request body.',
			};
		}

		res.send(await this.service.submitTransaction(tx));
	};
}
