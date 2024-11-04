// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { IPalletOnGoingReferenda, IReferendaInfo } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsOnGoingReferendaService extends AbstractService {
	/**
	 * Fetch all on-going referenda that have track: root (0) and whitelisted (1), along
	 * with their associated information.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async derivePalletOnGoingReferenda(hash: BlockHash): Promise<IPalletOnGoingReferenda> {
		const { api } = this;
		const [historicApi, { number }] = await Promise.all([api.at(hash), api.rpc.chain.getHeader(hash)]);
		const referenda: IReferendaInfo[] = [];
		if (historicApi.query.referenda) {
			const referendaEntries = await historicApi.query.referenda.referendumInfoFor.entries();
			for (const referendum of referendaEntries) {
				const referendumInfo = referendum[1];
				if (referendumInfo.isSome) {
					const refUnwrapped = referendumInfo.unwrap();
					const refId = referendum[0].toHuman() as string[];
					if (
						refUnwrapped.type == 'Ongoing' &&
						(refUnwrapped.asOngoing.track.toHuman() == '0' || refUnwrapped.asOngoing.track.toHuman() == '1')
					) {
						const decisionDeposit = refUnwrapped.asOngoing.decisionDeposit.isSome
							? refUnwrapped.asOngoing.decisionDeposit.unwrap()
							: null;
						const enactment = refUnwrapped.asOngoing.enactment;
						const submitted = refUnwrapped.asOngoing.submitted;
						const deciding = refUnwrapped.asOngoing.deciding.isSome ? refUnwrapped.asOngoing.deciding.unwrap() : null;

						const refInfo = { id: refId[0], decisionDeposit, enactment, submitted, deciding };
						referenda.push(refInfo);
					}
				}
			}
		} else {
			throw new Error(
				`The runtime does not include the module 'api.query.referenda' at this block height: ${number
					.unwrap()
					.toString(10)}`,
			);
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			referenda,
		};
	}
}
