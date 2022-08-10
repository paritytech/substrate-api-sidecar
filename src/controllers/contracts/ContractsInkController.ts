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

import { ContractsInkService } from '../../services';
import { IContract, IPostRequestHandler } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class ContractsInkController extends AbstractController<ContractsInkService> {
	constructor(api: ApiPromise) {
		super(api, '/contracts/ink/:address', new ContractsInkService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(
			this.path,
			ContractsInkController.catchWrap(this.getAccountBalance)
		);
	}

	/**
	 * Get the account balance for a given contract.
	 *
	 * @param _req
	 * @param res
	 */
	private getAccountBalance: IPostRequestHandler<IContract> = async (
		{ params: { address }, body: { metadata } },
		res
	): Promise<void> => {
		ContractsInkController.sanitizedSend(
			res,
			await this.service.fetchAccountBalance(address, metadata)
		);
	};
}
