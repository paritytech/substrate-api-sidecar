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
import { IAddressParam } from 'src/types/requests';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { validateAddress } from '../../../middleware';
import { RcAccountsProxyInfoService } from '../../../services';
import AbstractController from '../../AbstractController';

export default class RcAccountsProxyInfoController extends AbstractController<RcAccountsProxyInfoService> {
	static controllerName = 'RcAccountsProxyInfo';
	static requiredPallets = [['Proxy']];
	constructor(api: string) {
		super(api, '/rc/accounts/:address/proxy-info', new RcAccountsProxyInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([['', this.getAccountProxyInfo]]);
	}

	/**
	 * Get the latest account proxy info of `address` from the relay chain.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountProxyInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const historicApi = await rcApi.at(hash);

		RcAccountsProxyInfoController.sanitizedSend(
			res,
			await this.service.fetchAccountProxyInfo(hash, rcApi, historicApi, address),
		);
	};
}
