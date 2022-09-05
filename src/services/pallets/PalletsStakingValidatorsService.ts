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

import { IPalletStakingValidator, IValidator } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class PalletsStakingValidatorsService extends AbstractService {
	/**
	 * List all validators addresses and their status which can be either `active`
	 * or `waiting`.
	 * `Active` means that the validator is part of the active set and
	 * `waiting` means that the validator did not get into the active set this era.
	 *
	 * @returns all the validators addresses and their corresponding status
	 */
	async derivePalletStakingValidators(): Promise<IPalletStakingValidator> {
		const { api } = this;

		// Validators in the active set
		const validatorSession = await api.query.session.validators();
		let validatorSet: string[] = [];
		validatorSet = validatorSession.map((address) => address.toString());

		// All Validators : active & waiting
		const validatorAll: string[] = [];
		const validatorsEntries = await api.query.staking.validators.entries();
		validatorsEntries.forEach(([key]) => {
			validatorAll.push(key.args.map((k) => k.toHuman())[0]);
		});

		// Populates the list/array with the validators info that will be returned
		const validators: IValidator[] = [];
		for (const address of validatorAll) {
			const status: string = validatorSet.includes(address)
				? 'active'
				: 'waiting';
			validators.push({ address, status });
		}

		return {
			validators,
		};
	}
}
