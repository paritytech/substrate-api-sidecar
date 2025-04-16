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
		this.safeMountAsyncGetHandlers([['', this.getPalletOnGoingReferenda]]);
	}

	/**
	 * Get the on-going referenda.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getPalletOnGoingReferenda: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		PalletsOnGoingReferendaController.sanitizedSend(res, await this.service.derivePalletOnGoingReferenda(hash));
	};
}
