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
import { RequestHandler } from 'express';

import { validateBoolean } from '../../middleware';
import { NodeTransactionPoolService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET pending extrinsics from the Substrate node.
 *
 * Returns:
 * - `pool`: array of
 * 		- `hash`: H256 hash of the extrinsic.
 * 		- `encodedExtrinsic`: Scale encoded extrinsic.
 * 		- `tip`: Tip included into the extrinsic. Available when the `includeFee` query param is set to true.
 * 		- `priority`: Priority of the transaction. Calculated by tip * (max_block_{weight|length} / bounded_{weight|length}).
 * 			Available when the `includeFee` query param is set to true.
 * 		- `partialFee`: PartialFee for a transaction. Available when the `includeFee` query param is set to true.
 */
export default class NodeTransactionPoolController extends AbstractController<NodeTransactionPoolService> {
	constructor(api: ApiPromise) {
		super(api, '/node/transaction-pool', new NodeTransactionPoolService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateBoolean(['includeFee']));
		this.safeMountAsyncGetHandlers([['', this.getNodeTransactionPool]]);
	}

	/**
	 * GET pending extrinsics from the Substrate node.
	 *
	 * @param req Express Request, accepts the query param `includeFee`
	 * @param res Express Response
	 */
	private getNodeTransactionPool: RequestHandler = async ({ query: { includeFee } }, res): Promise<void> => {
		const shouldIncludeFee = includeFee === 'true';

		NodeTransactionPoolController.sanitizedSend(res, await this.service.fetchTransactionPool(shouldIncludeFee));
	};
}
