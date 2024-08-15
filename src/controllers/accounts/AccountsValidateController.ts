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

import { AccountsValidateService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class ValidateAddressController extends AbstractController<AccountsValidateService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/validate', new AccountsValidateService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.validateAddress]]);
	}

	private validateAddress: RequestHandler = ({ params: { address } }, res) => {
		ValidateAddressController.sanitizedSend(res, this.service.validateAddress(address));
	};
}
