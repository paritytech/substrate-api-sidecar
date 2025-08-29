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

import { RequestHandler } from 'express';

import { AhmInfoService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET Asset Hub Migration information.
 *
 * Paths:
 * - No path parameters required.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve AHM information. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - Additional AHM-specific data (to be implemented).
 *
 * Substrate Reference:
 * - TBD: Add relevant substrate references when implementing business logic
 */
export default class AhmInfoController extends AbstractController<AhmInfoService> {
	static controllerName = 'AhmInfo';
	static requiredPallets: string[][] = []; // TODO: Define required pallets when implementing logic

	constructor(api: string) {
		super(api, '/ahm-info', new AhmInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getAhmInfo]]);
	}

	/**
	 * Get Asset Hub Migration information.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAhmInfo: RequestHandler = async (_, res): Promise<void> => {
		const result = await this.service.fetchAhmInfo();

		AhmInfoController.sanitizedSend(res, result);
	};
}
