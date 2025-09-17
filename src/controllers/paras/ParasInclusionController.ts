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

import { u32 } from '@polkadot/types-codec';
import { RequestHandler } from 'express';

import { ParasInclusionService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class ParasInclusionController extends AbstractController<ParasInclusionService> {
	static controllerName = 'ParasInclusion';
	static requiredPallets = [['parachainInfo']];

	constructor(api: string) {
		super(api, '', new ParasInclusionService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['/paras/:number/inclusion', this.getParachainInclusion]]);
	}

	/**
	 * Get inclusion information for a specific parachain block.
	 *
	 * @param number - The parachain block number
	 * @param at - Optional relay chain block hash to search from
	 */
	private getParachainInclusion: RequestHandler<INumberParam> = async ({ params: { number } }, res): Promise<void> => {
		const [hash, paraId] = await Promise.all([
			this.getHashFromAt(number),
			this.api.query.parachainInfo.parachainId<u32>(),
		]);

		ParasInclusionController.sanitizedSend(res, await this.service.getParachainInclusion(hash, paraId, number));
	};
}
