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
import { ApiDecoration } from '@polkadot/api/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types-codec';

import { IPalletStakingValidator, IValidator } from '../../types/responses';
import { isBadStakingBlock } from '../../util/badStakingBlocks';
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

		if (!historicApi.query.staking) {
			throw new Error('Staking pallet not found for queried runtime');
		}

		const [{ number }, validatorsEntries] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.staking.validators.entries(),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		if (isBadStakingBlock(this.specName, number.unwrap().toNumber())) {
			let chainName = this.specName;
			switch (this.specName) {
				case 'westmint':
					chainName = 'Westend Asset Hub';
					break;
			}

			throw new Error(
				`Block ${number.unwrap().toString(10)} is in the list of known bad staking blocks in ${chainName}`,
			);
		}
		// Populating the returned array with the Validator address and its
		// status. If the address is found in the `validatorsActiveSet` then
		// status is `active` otherwise is set to `waiting`
		const validators: IValidator[] = [];
		// Active validators that wont be part of the next active validator set
		// for the incoming era.
		const validatorsToBeChilled: IValidator[] = [];
		const validatorsActiveSet = await this.getActiveValidators(historicApi);

		validatorsEntries.map(([key, prefs]) => {
			const address = key.args.map((k) => k.toString())[0];

			let status: 'active' | 'waiting';
			if (validatorsActiveSet.has(address)) {
				status = 'active';
				validatorsActiveSet.delete(address);
			} else {
				status = 'waiting';
			}

			validators.push({
				address,
				status,
				commission: prefs.commission ? prefs.commission.unwrap().toString() : undefined,
				blocked: prefs.blocked ? prefs.blocked.isTrue : false,
			});
		});

		// Any validators remaining in validatorsActiveSet are active in the current session
		// but don't have entries in staking.validators, which means they're being chilled
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

	/**
	 * Get the active validators given an era.
	 *
	 * @param historicApi
	 */
	async getActiveValidators(historicApi: ApiDecoration<'promise'>) {
		const validatorsActiveSet = new Set<string>();

		if (historicApi.query.staking.erasStakersOverview) {
			let activeEra: u32;
			const activeEraOption = await historicApi.query.staking.activeEra();
			if (activeEraOption.isNone) {
				const currentEraOption = await historicApi.query.staking.currentEra();
				if (currentEraOption.isNone) throw new Error('No active or current era was found');
				activeEra = currentEraOption.unwrap();
			} else {
				activeEra = activeEraOption.unwrap().index;
			}

			const vals = await historicApi.query.staking.erasStakersOverview.keys(activeEra);
			vals.forEach(({ args }) => validatorsActiveSet.add(args[1].toString()));
		} else {
			const validatorSession = await historicApi.query.session.validators();

			for (const address of validatorSession) {
				validatorsActiveSet.add(address.toString());
			}
		}

		return validatorsActiveSet;
	}
}
