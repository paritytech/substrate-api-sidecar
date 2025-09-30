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

import { RequestHandler } from 'express';
import { LRUCache } from 'lru-cache';
import { IBlock } from 'src/types/responses';

import { validateUseRcBlock } from '../../middleware/validate';
import { BlocksService } from '../../services';
import type { ControllerOptions } from '../../types/chains-config';
import type { IBlockQueryParams, INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
	private blockStore: LRUCache<string, IBlock>;
	static controllerName = 'BlocksExtrinsics';
	static requiredPallets = [['System', 'Session']];
	constructor(api: string, options: ControllerOptions) {
		super(
			api,
			'/blocks/:blockId/extrinsics',
			new BlocksService(api, options.minCalcFeeRuntime, options.hasQueryFeeApi),
		);
		this.initRoutes();
		this.blockStore = options.blockStore;
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([['/:extrinsicIndex', this.getExtrinsicByTimepoint]]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getExtrinsicByTimepoint: RequestHandler<INumberParam, unknown, unknown, IBlockQueryParams> = async (
		{ params: { blockId, extrinsicIndex }, query: { eventDocs, extrinsicDocs, noFees, useRcBlock, useEvmFormat } },
		res,
	): Promise<void> => {
		const useRcBlockArg = useRcBlock === 'true';

		if (useRcBlockArg) {
			// Treat the blockId parameter as a relay chain block identifier
			const rcAtResults = await this.getHashFromRcAt(blockId);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				BlocksExtrinsicsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const eventDocsArg = eventDocs === 'true';
				const extrinsicDocsArg = extrinsicDocs === 'true';
				const noFeesArg = noFees === 'true';

				const options = {
					eventDocs: eventDocsArg,
					extrinsicDocs: extrinsicDocsArg,
					checkFinalized: true,
					queryFinalizedHead: false,
					omitFinalizedTag: true,
					noFees: noFeesArg,
					checkDecodedXcm: false,
					paraId: undefined,
					useEvmAddressFormat: useEvmFormat === 'true',
				};

				const cacheKey =
					ahHash.toString() +
					Number(options.eventDocs) +
					Number(options.extrinsicDocs) +
					Number(options.checkFinalized) +
					Number(options.noFees) +
					Number(options.checkDecodedXcm) +
					Number(options.useEvmAddressFormat);

				const isBlockCached = this.blockStore.get(cacheKey);
				const historicApi = await this.api.at(ahHash);

				const block = isBlockCached ? isBlockCached : await this.service.fetchBlock(ahHash, historicApi, options);

				if (!isBlockCached) {
					this.blockStore.set(cacheKey, block);
				}

				/**
				 * Verify our param `extrinsicIndex` is an integer represented as a string
				 */
				this.parseNumberOrThrow(extrinsicIndex, '`exstrinsicIndex` path param is not a number');

				/**
				 * Change extrinsicIndex from a type string to a number before passing it
				 * into any service.
				 */
				const index = parseInt(extrinsicIndex, 10);

				const extrinsic = this.service.fetchExtrinsicByIndex(block, index);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();
				const enhancedResult = {
					...extrinsic,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			BlocksExtrinsicsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashForBlock(blockId);

			const eventDocsArg = eventDocs === 'true';
			const extrinsicDocsArg = extrinsicDocs === 'true';
			const noFeesArg = noFees === 'true';

			const options = {
				eventDocs: eventDocsArg,
				extrinsicDocs: extrinsicDocsArg,
				checkFinalized: true,
				queryFinalizedHead: false,
				omitFinalizedTag: true,
				noFees: noFeesArg,
				checkDecodedXcm: false,
				paraId: undefined,
				useEvmAddressFormat: useEvmFormat === 'true',
			};

			const cacheKey =
				hash.toString() +
				Number(options.eventDocs) +
				Number(options.extrinsicDocs) +
				Number(options.checkFinalized) +
				Number(options.noFees) +
				Number(options.checkDecodedXcm) +
				Number(options.useEvmAddressFormat);

			const isBlockCached = this.blockStore.get(cacheKey);
			const historicApi = await this.api.at(hash);

			const block = isBlockCached ? isBlockCached : await this.service.fetchBlock(hash, historicApi, options);

			if (!isBlockCached) {
				this.blockStore.set(cacheKey, block);
			}

			/**
			 * Verify our param `extrinsicIndex` is an integer represented as a string
			 */
			this.parseNumberOrThrow(extrinsicIndex, '`exstrinsicIndex` path param is not a number');

			/**
			 * Change extrinsicIndex from a type string to a number before passing it
			 * into any service.
			 */
			const index = parseInt(extrinsicIndex, 10);

			const extrinsic = this.service.fetchExtrinsicByIndex(block, index);

			BlocksExtrinsicsController.sanitizedSend(res, extrinsic);
		}
	};
}
