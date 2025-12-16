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
import BN from 'bn.js';

/**
 * Interface for the validation data args structure from setValidationData extrinsic.
 */
interface IValidationDataArgs {
	args: {
		data: {
			validationData: {
				relayParentNumber: number;
			};
		};
	};
}

/**
 * Interface for inclusion event data structure.
 */
interface IInclusionData {
	descriptor: {
		paraId: number;
	};
}

/**
 * Result of searching for a parachain block's inclusion on the relay chain.
 */
export interface IInclusionSearchResult {
	/** The relay chain block number where the parachain block was included */
	inclusionBlockNumber: number | null;
	/** The relay parent number from setValidationData */
	relayParentNumber: number;
	/** Whether the inclusion was found */
	found: boolean;
}

/** Default search depth for inclusion search */
const DEFAULT_SEARCH_DEPTH = 10;

/** Batch size for parallel searches */
const BATCH_SIZE = 5;

/**
 * Extract the relay chain parent block number from a parachain block.
 *
 * Parachain blocks contain a `parachainSystem.setValidationData` extrinsic that
 * includes the relay chain block number that was the parent when the parachain
 * block was created.
 *
 * Note: This is the relay PARENT, not the inclusion block. For the actual
 * inclusion block, use `getInclusionBlockNumber` or `searchForInclusionBlock`.
 *
 * @param api - The ApiPromise instance connected to the parachain
 * @param blockHash - The hash of the parachain block to extract relay parent from
 * @returns The relay chain parent block number as a BN
 * @throws Error if the block doesn't contain setValidationData extrinsic
 */
export const getRelayParentNumber = async (api: ApiPromise, blockHash: BlockHash): Promise<BN> => {
	const [apiAt, { block }] = await Promise.all([api.at(blockHash), api.rpc.chain.getBlock(blockHash)]);

	const setValidationData = block.extrinsics.find((ext) => {
		return ext.method.method.toString() === 'setValidationData';
	});

	if (!setValidationData) {
		throw new Error('Block does not contain setValidationData extrinsic. Cannot determine relay parent number.');
	}

	const callArgs = apiAt.registry.createType('Call', setValidationData.method);
	const { relayParentNumber } = (callArgs.toJSON() as unknown as IValidationDataArgs).args.data.validationData;

	return new BN(relayParentNumber);
};

/**
 * Extract relay parent number as a plain number (for use with search functions).
 *
 * @param api - The ApiPromise instance connected to the parachain
 * @param blockHash - The hash of the parachain block
 * @returns The relay chain parent block number as a number
 */
export const getRelayParentNumberRaw = async (api: ApiPromise, blockHash: BlockHash): Promise<number> => {
	const [apiAt, { block }] = await Promise.all([api.at(blockHash), api.rpc.chain.getBlock(blockHash)]);

	const setValidationData = block.extrinsics.find((ext) => {
		return ext.method.method.toString() === 'setValidationData';
	});

	if (!setValidationData) {
		throw new Error('Block does not contain setValidationData extrinsic. Cannot determine relay parent number.');
	}

	const callArgs = apiAt.registry.createType('Call', setValidationData.method);
	const { relayParentNumber } = (callArgs.toJSON() as unknown as IValidationDataArgs).args.data.validationData;

	return relayParentNumber;
};

/**
 * Check if a block contains the setValidationData extrinsic.
 *
 * This can be used to determine if a block is from a parachain (has validation data)
 * or a relay chain (does not have validation data).
 *
 * @param api - The ApiPromise instance
 * @param blockHash - The hash of the block to check
 * @returns true if the block contains setValidationData, false otherwise
 */
export const hasRelayParentData = async (api: ApiPromise, blockHash: BlockHash): Promise<boolean> => {
	const { block } = await api.rpc.chain.getBlock(blockHash);

	return block.extrinsics.some((ext) => ext.method.method.toString() === 'setValidationData');
};

/**
 * Search relay chain blocks for the inclusion of a specific parachain block.
 *
 * This searches relay chain blocks starting from `relayParentNumber + 1` looking
 * for a `paraInclusion.CandidateIncluded` event that matches the given parachain
 * block number and paraId.
 *
 * @param rcApi - The ApiPromise instance connected to the relay chain
 * @param paraId - The parachain ID (e.g., 1000 for Asset Hub)
 * @param parachainBlockNumber - The parachain block number to search for
 * @param relayParentNumber - The relay parent number from setValidationData
 * @param maxDepth - Maximum number of relay blocks to search (default: 10)
 * @returns The relay chain block number where inclusion was found, or null if not found
 */
export const searchForInclusionBlock = async (
	rcApi: ApiPromise,
	paraId: number,
	parachainBlockNumber: string,
	relayParentNumber: number,
	maxDepth: number = DEFAULT_SEARCH_DEPTH,
): Promise<number | null> => {
	// Search in batches for optimal performance
	// Most inclusions happen within 2-4 blocks of relayParentNumber
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
};

/**
 * Get the relay chain block number where a parachain block was included.
 *
 * This is the main function for finding the accurate relay chain block number
 * corresponding to a parachain block. It:
 * 1. Extracts the relayParentNumber from the parachain block's setValidationData
 * 2. Searches relay chain blocks for the actual inclusion event
 *
 * @param parachainApi - The ApiPromise instance connected to the parachain
 * @param rcApi - The ApiPromise instance connected to the relay chain
 * @param parachainBlockHash - The hash of the parachain block
 * @param paraId - The parachain ID (e.g., 1000 for Asset Hub)
 * @param maxDepth - Maximum number of relay blocks to search (default: 10)
 * @returns The inclusion search result with inclusionBlockNumber, relayParentNumber, and found status
 */
export const getInclusionBlockNumber = async (
	parachainApi: ApiPromise,
	rcApi: ApiPromise,
	parachainBlockHash: BlockHash,
	paraId: number,
	maxDepth: number = DEFAULT_SEARCH_DEPTH,
): Promise<IInclusionSearchResult> => {
	// Get the parachain block header to get the block number
	const header = await parachainApi.rpc.chain.getHeader(parachainBlockHash);
	const parachainBlockNumber = header.number.unwrap().toString();

	// Extract relay parent number from the parachain block
	const relayParentNumber = await getRelayParentNumberRaw(parachainApi, parachainBlockHash);

	// Search for the actual inclusion block
	const inclusionBlockNumber = await searchForInclusionBlock(
		rcApi,
		paraId,
		parachainBlockNumber,
		relayParentNumber,
		maxDepth,
	);

	return {
		inclusionBlockNumber,
		relayParentNumber,
		found: inclusionBlockNumber !== null,
	};
};
