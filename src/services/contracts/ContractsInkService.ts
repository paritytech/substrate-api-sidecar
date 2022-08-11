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

export class ContractsInkService extends AbstractService {
	/**
	 * Query the GET message from a contract.
	 *
	 * @param address AccountId associated with the contract.
	 * @param metadata ABI metadata associated with the contract.
	 */
	public async fetchContractCall(
		address: string,
		metadata: Record<string, unknown>,
		gasLimit?: string,
		storageDepositLimit?: string
	): Promise<ContractCallOutcome> {
		const { api } = this;

		const contract = new ContractPromise(api, metadata, address);

		if (!contract.query.get) {
			throw Error('Contract does not have the given GET message.');
		}

		const {
			debugMessage,
			gasConsumed,
			gasRequired,
			output,
			result,
			storageDeposit,
		} = await contract.query.get(address, {
			// TODO both these values could be query params
			gasLimit: gasLimit || -1,
			storageDepositLimit: storageDepositLimit || null,
		});

		return {
			debugMessage,
			gasConsumed,
			gasRequired,
			output,
			result,
			storageDeposit,
		};
	}
}
