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
	 * Query a given message method.
	 *
	 * @param contract ContractPromise that has decorated querys.
	 * @param address Address to query with the contract.
	 * @param method Message that will be queried.
	 * @param args Args to attach to the query.
	 * @param gasLimit Gas limit which will default to -1.
	 * @param storageDepositLimit Storage Deposit Limit that will default to null.
	 */
	public async fetchContractCall(
		contract: ContractPromise,
		address: string,
		method: string,
		args?: unknown[],
		gasLimit?: string,
		storageDepositLimit?: string,
	): Promise<ContractCallOutcome> {
		const options = {
			gasLimit: gasLimit || -1,
			storageDepositLimit: storageDepositLimit || null,
		};

		const callResult =
			args && args.length > 0
				? await contract.query[method](address, options, args)
				: await contract.query[method](address, options);

		const { debugMessage, gasConsumed, gasRequired, output, result, storageDeposit } = callResult;

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
