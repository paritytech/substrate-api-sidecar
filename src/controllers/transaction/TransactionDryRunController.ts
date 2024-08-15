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
import { BadRequest } from 'http-errors';

import { TransactionDryRunService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * Dry run an transaction.
 *
 * Returns:
 * - `at`:
 * 		- `hash`: The block's hash.
 * 		- `height`: The block's height.
 * - `dryRunResult`:
 * 		- `resultType`: Either `DispatchOutcome` if the construction is valid
 * 			or `TransactionValidityError` if the transaction has invalid construction.
 * 		- `result`: If there was an error it will be the cause of the error. If the
 * 			transaction executed correctly it will be `Ok: []`.
 * 		- `validityErrorType`: Only present if the `resultType` is
 * 			`TransactionValidityError`. Either `InvalidTransaction` or `UnknownTransaction`.
 *
 * References:
 * - `UnknownTransaction`: https://crates.parity.io/sp_runtime/transaction_validity/enum.UnknownTransaction.html
 * - `InvalidTransaction`: https://crates.parity.io/sp_runtime/transaction_validity/enum.InvalidTransaction.html
 *
 * Note: If you get the error `-32601: Method not found` it means that the node sidecar
 * is connected to does not expose the `system_dryRun` RPC. One way to resolve this
 * issue is to pass the `--rpc-external` flag to that node.
 */
export default class TransactionDryRunController extends AbstractController<TransactionDryRunService> {
	constructor(api: ApiPromise) {
		super(api, '/transaction/dry-run', new TransactionDryRunService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, TransactionDryRunController.catchWrap(this.dryRunTransaction));
	}

	private dryRunTransaction: IPostRequestHandler<ITx> = async ({ body: { tx }, query: { at } }, res): Promise<void> => {
		if (!tx) {
			throw new BadRequest('Missing field `tx` on request body.');
		}

		const hash = await this.getHashFromAt(at);

		TransactionDryRunController.sanitizedSend(res, await this.service.dryRuntExtrinsic(hash, tx));
	};
}
