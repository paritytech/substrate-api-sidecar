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

import { NodeVersionService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET information about the Substrates node's implementation and versioning.
 *
 * Returns:
 * - `clientVersion`: Node binary version.
 * - `clientImplName`: Node's implementation name.
 * - `chain`: Node's chain name.
 */
export default class NodeVersionController extends AbstractController<NodeVersionService> {
	constructor(api: ApiPromise) {
		super(api, '/node/version', new NodeVersionService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeVersion]]);
	}

	/**
	 * GET information about the Substrates node's implementation and versioning.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	getNodeVersion: RequestHandler = async (_req, res): Promise<void> => {
		NodeVersionController.sanitizedSend(res, await this.service.fetchVersion());
	};
}
