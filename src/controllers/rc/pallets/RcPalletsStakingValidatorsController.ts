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
import { validateUseRcBlock } from '../../../middleware';
import { PalletsStakingValidatorsService } from '../../../services';
import AbstractController from '../../AbstractController';

export default class RcPalletsStakingValidatorsController extends AbstractController<PalletsStakingValidatorsService> {
	static controllerName = 'RcPalletsStakingValidators';
	static requiredPallets = [['Session', 'Staking']];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/pallets/staking/validators', new PalletsStakingValidatorsService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([['', this.getPalletStakingValidators]]);
	}

	/**
	 * Get the progress of the staking pallet system.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getPalletStakingValidators: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}
		const hash = await this.getHashFromAt(at);
		const result = await this.service.derivePalletStakingValidators(hash);
		RcPalletsStakingValidatorsController.sanitizedSend(res, result);
	};
}
