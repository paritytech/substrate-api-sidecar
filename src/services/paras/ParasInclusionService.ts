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

import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types-codec';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { IParachainInclusion } from '../../types/responses';
// import { BadRequest } from 'http-errors';
import { AbstractService } from '../AbstractService';

interface IValidationDataArgs {
	args: {
		data: {
			validationData: {
				relayParentNumber: number;
			};
		};
	};
}

interface IInclusionData {
	descriptor: {
		paraId: number;
	};
}

export class ParasInclusionService extends AbstractService {
	constructor(api: string) {
		super(api);
	}

	/**
	 * Find the relay chain inclusion information for a specific parachain block.
	 *
	 * @param hash - The relay chain block hash to start searching from
	 * @param blockNumber - The parachain block number
	 */
	async getParachainInclusion(hash: BlockHash, paraId: u32, number: string): Promise<IParachainInclusion> {
		const { api } = this;
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;
		const DEPTH = 10;

		if (!rcApi) {
			throw new Error('Relay chain api must be available');
		}

		const { block } = await api.rpc.chain.getBlock(hash);

		const setValidationData = block.extrinsics.find((ext) => {
			return ext.method.method.toString() === 'setValidationData';
		});

		if (!setValidationData) {
			throw new Error("Block contains no set validation data. Can't find relayParentNumber");
		}

		const callArgs = this.api.createType('Call', setValidationData);
		const { relayParentNumber } = (callArgs.toJSON() as unknown as IValidationDataArgs).args.data.validationData;

		// Search for inclusion starting from relay_parent_number + 1
		const inclusionNumber = await this.searchForInclusion(
			rcApi,
			paraId.toNumber(),
			number, // parachain block number
			relayParentNumber,
			DEPTH,
		);

		// For now, return a placeholder response
		return {
			parachainBlock: parseInt(number, 10),
			parachainBlockHash: hash.toString(),
			parachainId: paraId.toNumber(),
			relayParentNumber,
			inclusionNumber: inclusionNumber || null,
			found: inclusionNumber !== null,
		};
	}

	/**
	 * Search relay chain blocks for inclusion of a specific parachain block
	 */
	private async searchForInclusion(
		rcApi: ApiPromise, // relay chain API
		paraId: number,
		parachainBlockNumber: string,
		relayParentNumber: number,
		maxDepth: number,
	): Promise<number | null> {
		for (let i = 1; i <= maxDepth; i++) {
			const searchBlockNumber = relayParentNumber + i;
			// Get relay chain block hash
			const relayBlockHash = await rcApi.rpc.chain.getBlockHash(searchBlockNumber);

			// Get candidate events for this relay block
			const rcApiAt = await rcApi.at(relayBlockHash);
			const events = await rcApiAt.query.system.events();

			const inclusionEvent = events.filter((record) => {
				if (record.event.section === 'paraInclusion' && record.event.method === 'CandidateIncluded') {
					return (record.event.data[0].toJSON() as unknown as IInclusionData).descriptor.paraId === paraId;
				}
				return false;
			});

			const foundInclusion = inclusionEvent.find((record) => {
				const header = rcApiAt.registry.createType('Header', record.event.data[1]);
				return header.number.toString() === parachainBlockNumber;
			});

			if (foundInclusion) {
				return searchBlockNumber;
			}
		}

		return null;
	}
}
