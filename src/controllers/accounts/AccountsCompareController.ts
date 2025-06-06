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
import { BadRequest } from 'http-errors';

import { validateAddressQueryParam } from '../../middleware';
import { AccountsCompareService } from '../../services/accounts';
import { ICompareQueryParams } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class AccountsCompareController extends AbstractController<AccountsCompareService> {
	static controllerName = 'AccountsCompare';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/accounts/compare', new AccountsCompareService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddressQueryParam);
		this.safeMountAsyncGetHandlers([['', this.accountCompare]]);
	}

	private accountCompare: RequestHandler<unknown, unknown, ICompareQueryParams> = ({ query: { addresses } }, res) => {
		const addressesArray = Array.isArray(addresses)
			? (addresses as string[] | string)
			: (addresses as string).split(',');

		// Check that the number of addresses is less than 30.
		if (addressesArray.length > 30) {
			throw new BadRequest(`Please limit the amount of address parameters to 30.`);
		}

		AccountsCompareController.sanitizedSend(res, this.service.accountCompare(addressesArray as string[]));
	};
}
