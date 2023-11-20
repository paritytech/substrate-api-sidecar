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
import { ContractPromise } from '@polkadot/api-contract';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { validateAddress } from '../../middleware';
import { ContractsInkService } from '../../services';
import { IBodyContractMetadata, IContractQueryParam, IPostRequestHandler } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class ContractsInkController extends AbstractController<ContractsInkService> {
	constructor(api: ApiPromise) {
		super(api, '/contracts/ink/:address', new ContractsInkService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);
		this.safeMountAsyncPostHandlers([['/query', this.callContractQuery as RequestHandler]]);
	}

	/**
	 * Send a message call to a contract. It defaults to get if nothing is inputted.
	 *
	 * @param _req
	 * @param res
	 */
	private callContractQuery: IPostRequestHandler<IBodyContractMetadata, IContractQueryParam> = async (
		{ params: { address }, body, query: { method = 'get', gasLimit, storageDepositLimit, args } },
		res,
	): Promise<void> => {
		const { api } = this;
		const argsArray = Array.isArray(args) ? args : [];
		const contract = new ContractPromise(api, body, address);
		if (!contract.query[method]) {
			throw new BadRequest(`Invalid Method: Contract does not have the given ${method} message.`);
		}

		const callMeta = contract.query[method].meta;
		if (callMeta.isPayable || callMeta.isMutating) {
			throw new BadRequest(`Invalid Method: This endpoint does not handle mutating or payable calls.`);
		}

		ContractsInkController.sanitizedSend(
			res,
			await this.service.fetchContractCall(contract, address, method, argsArray, gasLimit, storageDepositLimit),
		);
	};
}
