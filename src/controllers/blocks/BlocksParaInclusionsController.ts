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

import { BlocksParaInclusionsService } from '../../services';
import type { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * Controller for /blocks/{blockId}/para-inclusions endpoint
 * Returns all decoded parachain inclusion information for a relay chain block
 */
export default class BlocksParaInclusionsController extends AbstractController<BlocksParaInclusionsService> {
	static controllerName = 'BlocksParaInclusions';
	static requiredPallets = [['ParaInclusion']];

	constructor(api: string) {
		super(api, '/blocks/:blockId/para-inclusions', new BlocksParaInclusionsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getParaInclusions]]);
	}

	/**
	 * Get all parachain inclusions for a relay chain block
	 *
	 * @param blockId - The relay chain block identifier (hash or number)
	 */
	private getParaInclusions: RequestHandler<INumberParam> = async ({ params: { blockId } }, res): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);

		BlocksParaInclusionsController.sanitizedSend(res, await this.service.fetchParaInclusions(hash));
	};
}
