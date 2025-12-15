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

import { BlockHash } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types-codec';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { IParachainInclusion } from '../../types/responses';
import { getRelayParentNumberRaw, searchForInclusionBlock } from '../../util/relay/getRelayParentNumber';
import { AbstractService } from '../AbstractService';

export class ParasInclusionService extends AbstractService {
	constructor(api: string) {
		super(api);
	}

	/**
	 * Find the relay chain inclusion information for a specific parachain block.
	 *
	 * @param hash - The parachain block hash
	 * @param paraId - The parachain ID
	 * @param number - The parachain block number
	 * @param depth - Search depth (defaults to 10)
	 */
	async getParachainInclusion(hash: BlockHash, paraId: u32, number: string, depth = 10): Promise<IParachainInclusion> {
		const { api } = this;
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain api must be available');
		}

		// Extract relay parent number from the parachain block
		const relayParentNumber = await getRelayParentNumberRaw(api, hash);

		// Search for inclusion starting from relay_parent_number + 1
		const inclusionNumber = await searchForInclusionBlock(
			rcApi,
			paraId.toNumber(),
			number, // parachain block number
			relayParentNumber,
			depth,
		);

		return {
			parachainBlock: parseInt(number, 10),
			parachainBlockHash: hash.toString(),
			parachainId: paraId.toNumber(),
			relayParentNumber,
			inclusionNumber: inclusionNumber || null,
			found: inclusionNumber !== null,
		};
	}
}
