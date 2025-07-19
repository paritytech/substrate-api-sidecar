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

import { BlockHash } from '@polkadot/types/interfaces';
import { RequestHandler } from 'express';

import { validateRcAt } from '../../middleware';
import { PalletsOnGoingReferendaService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsOnGoingReferendaController extends AbstractController<PalletsOnGoingReferendaService> {
	static controllerName = 'PalletsOnGoingReferenda';
	static requiredPallets = [['Referenda']];
	constructor(api: string) {
		super(api, '/pallets/on-going-referenda', new PalletsOnGoingReferendaService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([['', this.getPalletOnGoingReferenda]]);
	}

	/**
	 * Get the on-going referenda.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getPalletOnGoingReferenda: RequestHandler = async ({ query: { at, rcAt } }, res): Promise<void> => {
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.derivePalletOnGoingReferenda(hash);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsOnGoingReferendaController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsOnGoingReferendaController.sanitizedSend(res, result);
		}
	};
}
