// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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
import { BlockHash } from '@polkadot/types/interfaces';

import { IPalletStakingValidator, IValidator } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsStakingValidatorsService extends AbstractService {
	/**
	 * Fetch all validators addresses and their status at a given block.
	 * The status of the validator can be either:
	 * - `active` (validator is part of the active set) or
	 * - `waiting` (validator did not get into the active set this era)
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async derivePalletStakingValidators(hash: BlockHash): Promise<IPalletStakingValidator> {
		const { api } = this;
		const historicApi = await api.at(hash);
		const [{ number }, validatorSession, validatorsEntries] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.session.validators(),
			historicApi.query.staking.validators.entries(),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		const validatorsActiveSet = new Set<string>();
		for (const address of validatorSession) {
			validatorsActiveSet.add(address.toString());
		}

		// Populating the returned array with the Validator address and its
		// status. If the address is found in the `validatorsActiveSet` then
		// status is `active` otherwise is set to `waiting`
		const validators: IValidator[] = [];
		// Active validators that wont be part of the next active validator set
		// for the incoming era.
		const validatorsToBeChilled: IValidator[] = [];

		validatorsEntries.map(([key]) => {
			const address = key.args.map((k) => k.toString())[0];
			let status: 'active' | 'waiting';
			if (validatorsActiveSet.has(address)) {
				status = 'active';
				validatorsActiveSet.delete(address);
			} else {
				status = 'waiting';
			}
			validators.push({ address, status });
		});

		if (validatorsActiveSet.size > 0) {
			validatorsActiveSet.forEach((address) => {
				validators.push({ address, status: 'active' });
				validatorsToBeChilled.push({ address, status: 'active' });
			});
		}

		return {
			at,
			validators,
			validatorsToBeChilled,
		};
	}
}
