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
import { validateAddress, validateBoolean } from '../../../middleware';
import { AccountsBalanceInfoService } from '../../../services';
import AbstractController from '../../AbstractController';

export default class AccountsBalanceController extends AbstractController<AccountsBalanceInfoService> {
	static controllerName = 'RcAccountsBalanceInfo';
	static requiredPallets = [['Balances', 'System']];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/accounts/:address/balance-info', new AccountsBalanceInfoService(rcSpecName));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateBoolean(['denominated']));

		this.safeMountAsyncGetHandlers([['', this.getAccountBalanceInfo]]);
	}

	/**
	 * Get the latest account balance summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountBalanceInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at, token, denominated } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const tokenArg =
			typeof token === 'string'
				? token.toUpperCase()
				: // We assume the first token is the native token
					rcApi.registry.chainTokens[0].toUpperCase();
		const withDenomination = denominated === 'true';

		const hash = await this.getHashFromAt(at, { api: rcApi });
		const historicApi = await rcApi.at(hash);

		AccountsBalanceController.sanitizedSend(
			res,
			await this.service.fetchAccountBalanceInfo(hash, historicApi, address, tokenArg, withDenomination),
		);
	};
}
