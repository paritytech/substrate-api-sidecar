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

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { BlocksService } from '../../../services';
import type { ControllerOptions } from '../../../types/chains-config';
import type { IBlockQueryParams, INumberParam } from '../../../types/requests';
import AbstractController from '../../AbstractController';

export default class RcBlocksExtrinsicsController extends AbstractController<BlocksService> {
	private blockStore: LRUCache<string, IBlock>;
	static controllerName = 'RcBlocksExtrinsics';
	static requiredPallets = [['System', 'Session']];
	constructor(_api: string, options: ControllerOptions) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(
			rcSpecName,
			'/rc/blocks/:blockId/extrinsics',
			new BlocksService(rcSpecName, options.minCalcFeeRuntime, options.hasQueryFeeApi),
		);
		this.initRoutes();
		this.blockStore = options.blockStore;
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['/:extrinsicIndex', this.getExtrinsicByTimepoint]]);
	}

	private getExtrinsicByTimepoint: RequestHandler<INumberParam, unknown, unknown, IBlockQueryParams> = async (
		{ params: { blockId, extrinsicIndex }, query: { eventDocs, extrinsicDocs, noFees } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(blockId, { api: rcApi });

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
		};

		const cacheKey =
			hash.toString() +
			Number(options.eventDocs) +
			Number(options.extrinsicDocs) +
			Number(options.checkFinalized) +
			Number(options.noFees) +
			Number(options.checkDecodedXcm);

		const isBlockCached = this.blockStore.get(cacheKey);
		const historicApi = await rcApi.at(hash);

		const block = isBlockCached ? isBlockCached : await this.service.fetchBlock(hash, historicApi, options);

		if (!isBlockCached) {
			this.blockStore.set(cacheKey, block);
		}

		this.parseNumberOrThrow(extrinsicIndex, '`extrinsicIndex` path param is not a number');

		const index = parseInt(extrinsicIndex, 10);

		const extrinsic = this.service.fetchExtrinsicByIndex(block, index);

		RcBlocksExtrinsicsController.sanitizedSend(res, extrinsic);
	};
}
