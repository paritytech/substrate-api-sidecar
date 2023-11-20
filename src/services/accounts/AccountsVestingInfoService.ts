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

import { BlockHash } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';
import { IAccountVestingInfo } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsVestingInfoService extends AbstractService {
	/**
	 * Fetch vesting information for an account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the account to get the vesting info of
	 */
	async fetchAccountVestingInfo(hash: BlockHash, address: string): Promise<IAccountVestingInfo> {
		const { api } = this;

		const historicApi = await api.at(hash);

		if (!historicApi.query.vesting) {
			throw new BadRequest(`Vesting pallet does not exist on the specified blocks runtime version`);
		}

		const [{ number }, vesting] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.vesting.vesting(address),
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		if (vesting.isNone) {
			return {
				at,
				vesting: [],
			};
		} else {
			const unwrapVesting = vesting.unwrap();

			return {
				at,
				vesting: Array.isArray(unwrapVesting) ? unwrapVesting : [unwrapVesting],
			};
		}
	}
}
