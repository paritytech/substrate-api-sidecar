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
import { PolkadotPrimitivesVstagingCandidateReceiptV2 } from '@polkadot/types/lookup';
import { BadRequest } from 'http-errors';

import { IBlockParaInclusions } from '../../types/responses';
import { AbstractService } from '../AbstractService';

/**
 * Service for fetching parachain inclusion information from relay chain blocks
 */
export class BlocksParaInclusionsService extends AbstractService {
	constructor(api: string) {
		super(api);
	}

	/**
	 * Fetch all decoded parachain inclusion information for a relay chain block
	 *
	 * @param hash - The relay chain block hash to query
	 * @param paraIdFilter - Optional parachain ID to filter results
	 * @returns IBlockParaInclusions containing all parachain inclusions in the block
	 */
	async fetchParaInclusions(hash: BlockHash, paraIdFilter?: number): Promise<IBlockParaInclusions> {
		const { api } = this;

		const [apiAt, header] = await Promise.all([api.at(hash), api.rpc.chain.getHeader(hash)]);

		const events = await apiAt.query.system.events();

		const inclusionEvents = events.filter((record) => {
			return record.event.section === 'paraInclusion' && record.event.method === 'CandidateIncluded';
		});

		if (inclusionEvents.length === 0) {
			throw new BadRequest(
				`Block ${header.number.toString()} on chain ${this.specName} doesn't have the paraInclusion event`,
			);
		}

		const inclusions = inclusionEvents.map((record) => {
			const eventData = record.event.data;

			const candidateReceipt = eventData[0].toJSON() as unknown as PolkadotPrimitivesVstagingCandidateReceiptV2;
			const descriptor = candidateReceipt.descriptor;

			const headData = eventData[1];
			const header = apiAt.registry.createType('Header', headData);
			const paraBlockNumber = header.number.toNumber();
			const paraBlockHash = header.hash.toString();

			const coreIndex = eventData[2].toString();
			const groupIndex = eventData[3].toString();

			return {
				paraId: descriptor.paraId.toString(),
				paraBlockNumber,
				paraBlockHash,
				descriptor: {
					relayParent: descriptor.relayParent.toString(),
					persistedValidationDataHash: descriptor.persistedValidationDataHash.toString(),
					povHash: descriptor.povHash.toString(),
					erasureRoot: descriptor.erasureRoot.toString(),
					paraHead: descriptor.paraHead.toString(),
					validationCodeHash: descriptor.validationCodeHash.toString(),
				},
				commitmentsHash: candidateReceipt.commitmentsHash.toString(),
				coreIndex,
				groupIndex,
			};
		});

		const filteredInclusions =
			paraIdFilter !== undefined
				? inclusions.filter((inclusion) => parseInt(inclusion.paraId) === paraIdFilter)
				: inclusions;

		return {
			at: {
				hash: hash.toString(),
				height: header.number.toString(),
			},
			inclusions: filteredInclusions.sort((a, b) => parseInt(a.paraId) - parseInt(b.paraId)),
		};
	}
}
