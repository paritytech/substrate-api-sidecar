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
	 * @param depth - Search depth (defaults to 10)
	 */
	async getParachainInclusion(hash: BlockHash, paraId: u32, number: string, depth = 10): Promise<IParachainInclusion> {
		const { api } = this;
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain api must be available');
		}

		const [apiAt, { block }] = await Promise.all([api.at(hash), api.rpc.chain.getBlock(hash)]);

		const setValidationData = block.extrinsics.find((ext) => {
			return ext.method.method.toString() === 'setValidationData';
		});

		if (!setValidationData) {
			throw new Error("Block contains no set validation data. Can't find relayParentNumber");
		}

		const callArgs = apiAt.registry.createType('Call', setValidationData.method);
		const { relayParentNumber } = (callArgs.toJSON() as unknown as IValidationDataArgs).args.data.validationData;

		// Search for inclusion starting from relay_parent_number + 1
		const inclusionNumber = await this.searchForInclusion(
			rcApi,
			paraId.toNumber(),
			number, // parachain block number
			relayParentNumber,
			depth,
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
	 * Uses optimized candidate_events runtime API when available, falls back to system events for historical support
	 */
	private async searchForInclusion(
		rcApi: ApiPromise,
		paraId: number,
		parachainBlockNumber: string,
		relayParentNumber: number,
		maxDepth: number,
	): Promise<number | null> {
		return this.searchWithSystemEvents(rcApi, paraId, parachainBlockNumber, relayParentNumber, maxDepth);
	}

	/**
	 * Fallback search using system events (for historical compatibility)
	 */
	private async searchWithSystemEvents(
		rcApi: ApiPromise,
		paraId: number,
		parachainBlockNumber: string,
		relayParentNumber: number,
		maxDepth: number,
	): Promise<number | null> {
		// The number is 5 here since most searches are relative to 2-4 blocks from the `relayParentNumber`.
		// Therefore we give 1 extra block for extra room, while also minimizing the amount of searches we do.
		const BATCH_SIZE = 5;

		// Search in batches of 5 for optimal performance
		for (let offset = 0; offset < maxDepth; offset += BATCH_SIZE) {
			const batchSize = Math.min(BATCH_SIZE, maxDepth - offset);
			const searchBlocks = Array.from({ length: batchSize }, (_, i) => relayParentNumber + offset + i + 1);

			const searchPromises = searchBlocks.map(async (blockNum) => {
				try {
					const relayBlockHash = await rcApi.rpc.chain.getBlockHash(blockNum);
					const rcApiAt = await rcApi.at(relayBlockHash);
					const events = await rcApiAt.query.system.events();

					const foundInclusion = events.find((record) => {
						if (record.event.section === 'paraInclusion' && record.event.method === 'CandidateIncluded') {
							const eventData = record.event.data[0].toJSON() as unknown as IInclusionData;
							if (eventData.descriptor.paraId === paraId) {
								const header = rcApiAt.registry.createType('Header', record.event.data[1]);
								return header.number.toString() === parachainBlockNumber;
							}
						}
						return false;
					});

					return foundInclusion ? blockNum : null;
				} catch {
					return null;
				}
			});

			const results = await Promise.all(searchPromises);
			const found = results.find((result) => result !== null);

			if (found) {
				return found; // Early termination when found in this batch
			}
		}

		return null; // Not found within search depth
	}
}
