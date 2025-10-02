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

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { BlocksParaInclusionsService } from '../../../services';
import type { INumberParam } from '../../../types/requests';
import AbstractController from '../../AbstractController';

/**
 * Controller for /rc/blocks/{blockId}/para-inclusions endpoint
 * Returns all decoded parachain inclusion information for a relay chain block
 */
export default class RcBlocksParaInclusionsController extends AbstractController<BlocksParaInclusionsService> {
	static controllerName = 'RcBlocksParaInclusions';
	static requiredPallets = [['ParaInclusion']];

	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}

		super(rcSpecName, '/rc/blocks/:blockId/para-inclusions', new BlocksParaInclusionsService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getParaInclusions]]);
	}

	/**
	 * Get all parachain inclusions for a relay chain block
	 *
	 * @param blockId - The relay chain block identifier (hash or number)
	 * @param paraId - Optional parachain ID to filter results
	 */
	private getParaInclusions: RequestHandler<INumberParam> = async (
		{ params: { blockId }, query: { paraId } },
		res,
	): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);

		const paraIdFilter = paraId
			? this.parseNumberOrThrow(paraId as string, 'paraId must be a valid integer')
			: undefined;

		RcBlocksParaInclusionsController.sanitizedSend(res, await this.service.fetchParaInclusions(hash, paraIdFilter));
	};
}
