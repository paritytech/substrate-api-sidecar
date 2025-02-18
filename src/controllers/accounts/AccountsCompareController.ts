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

import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { validateAddressQueryParam } from '../../middleware';
import { AccountsCompareService } from '../../services/accounts';
import { ICompareQueryParams } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class AccountsCompareController extends AbstractController<AccountsCompareService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/compare', new AccountsCompareService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddressQueryParam);
		this.safeMountAsyncGetHandlers([['', this.accountCompare]]);
	}

	private accountCompare: RequestHandler<unknown, unknown, ICompareQueryParams> = ({ query }, res) => {
		const addressQueryParams = Object.keys(query);

		// Check that the query parameters are named correctly.
		const invalidParams = addressQueryParams.filter((key) => !/^address\d+$/.test(key));
		if (invalidParams.length > 0) {
			throw new BadRequest(
				`Invalid query parameter found: ${invalidParams.join(', ')}. Address parameters should be provided as query parameters with names such as address1, address2, address3, and so on.`,
			);
		}

		// Check that at least two addresses are provided.
		if (addressQueryParams.length === 0 || addressQueryParams.length === 1) {
			throw new BadRequest(
				`At least two addresses are required for comparison. Address parameters should be provided as query parameters with names such as address1, address2, address3, and so on.`,
			);
		}

		// Check that the number of addresses is less than 30.
		if (addressQueryParams.length > 30) {
			throw new BadRequest(
				`Please limit the amount of address parameters to 30. Address parameters should be provided as query parameters with names such as address1, address2, address3, and so on.`,
			);
		}

		// Check for duplicate names of query params. If there is an array in the query params, it means that the user has provided multiple values for the same key (duplicate name of a query parameter).
		const hasArrays = Object.values(query).some((value) => Array.isArray(value));
		if (hasArrays) {
			const duplicateQueryParam = Object.keys(query).filter((key) => Array.isArray(query[key]));
			throw new BadRequest(
				`Duplicate query parameters found: ${duplicateQueryParam.join(', ')}. Address parameters should be provided as query parameters with names such as address1, address2, address3, and so on.`,
			);
		}

		const addresses = Object.keys(query).map((key) => query[key]);

		AccountsCompareController.sanitizedSend(res, this.service.accountCompare(addresses as string[]));
	};
}
