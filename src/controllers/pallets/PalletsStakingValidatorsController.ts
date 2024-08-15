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

import { PalletsStakingValidatorsService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsStakingValidatorsController extends AbstractController<PalletsStakingValidatorsService> {
	constructor(api: ApiPromise) {
		super(api, '/pallets/staking/validators', new PalletsStakingValidatorsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getPalletStakingValidators]]);
	}

	/**
	 * Get the progress of the staking pallet system.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getPalletStakingValidators: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		PalletsStakingValidatorsController.sanitizedSend(res, await this.service.derivePalletStakingValidators(hash));
	};
}
