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

import { ContractPromise } from '@polkadot/api-contract';
import { ContractCallOutcome } from '@polkadot/api-contract/types';

import { AbstractService } from '../AbstractService';

interface IContractsInkAccountBalance {
	response: ContractCallOutcome;
}

export class ContractsInkService extends AbstractService {
	async fetchAccountBalance(
		address: string,
		metadata: Record<string, unknown>
	): Promise<IContractsInkAccountBalance> {
		const { api } = this;

		const contract = new ContractPromise(api, metadata, address);
		const res = await contract.query.get(address, {
			// TODO both these values could be query params
			gasLimit: -1,
			storageDepositLimit: null,
		});
		console.log(res);

		return {
			response: res,
		};
	}
}
