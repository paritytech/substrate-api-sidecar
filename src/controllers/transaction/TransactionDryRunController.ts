// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { BadRequest } from 'http-errors';

import { TransactionDryRunService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * Dry run a transaction.
 *
 * Returns:
 * - `at`:
 * 		- `hash`: The block's hash.
 * 		- `height`: The block's height.
 * - `result`:
 * 		- Successfull dry run:
 * 			- `actualWeight`: The actual weight of the transaction.
 * 			- `paysFee`: The fee to be paid.
 * 		- Failed dry run:
 * 			- error reason.
 * 		- Dry run not possible to run:
 * 			- `isUnimplemented`: The dry run is not implemented.
 * 			- `isVersionedConversionFailed`: The versioned conversion failed.
 * 			- `type`: 'Unimplemented' | 'VersionedConversionFailed';.
 *
 * References:
 * - `DispatchError`: https://docs.rs/sp-runtime/39.0.1/sp_runtime/enum.DispatchError.html
 * - `PostDispatchInfo`: https://docs.rs/frame-support/38.0.0/frame_support/dispatch/struct.PostDispatchInfo.html
 * - `Error Type`: https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/enum.Error.html
 *
 * Note: If you get the error `-32601: Method not found` it means that the node sidecar
 * is connected to does not expose the `system_dryRun` RPC. One way to resolve this
 * issue is to pass the `--rpc-external` flag to that node.
 */
export default class TransactionDryRunController extends AbstractController<TransactionDryRunService> {
	static controllerName = 'TransactionDryRun';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/transaction/dry-run', new TransactionDryRunService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, TransactionDryRunController.catchWrap(this.dryRunTransaction));
	}

	private dryRunTransaction: IPostRequestHandler<ITx> = async (
		{ body: { tx, at, senderAddress, xcmVersion } },
		res,
	): Promise<void> => {
		if (!tx) {
			throw new BadRequest('Missing field `tx` on request body.');
		}

		if (!senderAddress) {
			throw new BadRequest('Missing field `senderAddress` on request body.');
		}

		const hash = await this.getHashFromAt(at);

		TransactionDryRunController.sanitizedSend(
			res,
			await this.service.dryRuntExtrinsic(senderAddress, tx, hash, xcmVersion),
		);
	};
}
