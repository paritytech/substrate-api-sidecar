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

import type { BlockHash } from '@polkadot/types/interfaces';
import { isHex } from '@polkadot/util';
import { RequestHandler, Response } from 'express';
import { BadRequest } from 'http-errors';
import type { LRUCache } from 'lru-cache';
import type client from 'prom-client';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { validateBoolean } from '../../../middleware/validate';
import { BlocksService } from '../../../services';
import { ControllerOptions } from '../../../types/chains-config';
import {
	IBlockQueryParams,
	IMetrics,
	INumberParam,
	IRangeQueryParam,
	IRequestHandlerWithMetrics,
} from '../../../types/requests';
import { IBlock } from '../../../types/responses';
import { PromiseQueue } from '../../../util/PromiseQueue';
import AbstractController from '../../AbstractController';

export default class RcBlocksController extends AbstractController<BlocksService> {
	private blockStore: LRUCache<string, IBlock>;
	static controllerName = 'RcBlocks';
	static requiredPallets = [['System', 'Session']];
	constructor(
		_api: string,
		private readonly options: ControllerOptions,
	) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/blocks', new BlocksService(rcSpecName, options.minCalcFeeRuntime, options.hasQueryFeeApi));
		this.initRoutes();
		this.blockStore = options.blockStore;
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateBoolean(['eventDocs', 'extrinsicDocs', 'finalized']));
		this.safeMountAsyncGetHandlers([
			['/', this.getBlocks],
			['/head', this.getLatestBlock],
			['/:number', this.getBlockById],
			['/head/header', this.getLatestBlockHeader],
			['/:number/header', this.getBlockHeaderById],
		]);
	}

	private emitExtrinsicMetrics = (
		totExtrinsics: number,
		totBlocks: number,
		method: string,
		path: string,
		res: Response<unknown, IMetrics>,
	): void => {
		if (res.locals.metrics) {
			const seconds = res.locals.metrics.timer();

			const extrinsics_in_request = res.locals.metrics.registry['sas_extrinsics_in_request'] as client.Histogram;
			extrinsics_in_request.labels({ method: method, route: path, status_code: res.statusCode }).observe(totExtrinsics);

			const extrinsics_per_second = res.locals.metrics.registry['sas_extrinsics_per_second'] as client.Histogram;
			extrinsics_per_second
				.labels({ method: method, route: path, status_code: res.statusCode })
				.observe(totExtrinsics / seconds);

			const extrinsicsPerBlockMetrics = res.locals.metrics.registry['sas_extrinsics_per_block'] as client.Histogram;
			extrinsicsPerBlockMetrics
				.labels({ method: 'GET', route: path, status_code: res.statusCode })
				.observe(totExtrinsics / totBlocks);

			const seconds_per_block = res.locals.metrics.registry['sas_seconds_per_block'] as client.Histogram;
			seconds_per_block
				.labels({ method: method, route: path, status_code: res.statusCode })
				.observe(seconds / totBlocks);

			if (totBlocks > 1) {
				const seconds_per_block = res.locals.metrics.registry['sas_seconds_per_block'] as client.Histogram;
				seconds_per_block
					.labels({ method: method, route: path, status_code: res.statusCode })
					.observe(seconds / totBlocks);
			}
		}
	};

	private getLatestBlock: IRequestHandlerWithMetrics<unknown, IBlockQueryParams> = async (
		{ query: { eventDocs, extrinsicDocs, finalized, noFees, decodedXcmMsgs, paraId }, method, route },
		res,
	) => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';

		let hash, queryFinalizedHead, omitFinalizedTag;
		if (!this.options.finalizes) {
			omitFinalizedTag = true;
			queryFinalizedHead = false;
			hash = (await rcApi.rpc.chain.getHeader()).hash;
		} else if (finalized === 'false') {
			omitFinalizedTag = false;
			queryFinalizedHead = true;
			hash = (await rcApi.rpc.chain.getHeader()).hash;
		} else {
			omitFinalizedTag = false;
			queryFinalizedHead = false;
			hash = await rcApi.rpc.chain.getFinalizedHead();
		}

		const noFeesArg = noFees === 'true';
		const decodedXcmMsgsArg = decodedXcmMsgs === 'true';
		const paraIdArg = paraId ? this.parseNumberOrThrow(paraId, 'paraId must be an integer') : undefined;

		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized: false,
			queryFinalizedHead,
			omitFinalizedTag,
			noFees: noFeesArg,
			checkDecodedXcm: decodedXcmMsgsArg,
			paraId: paraIdArg,
		};

		const cacheKey = hash.toString() + Object.values(options).join();

		const isBlockCached = this.blockStore.get(cacheKey);

		if (isBlockCached) {
			RcBlocksController.sanitizedSend(res, isBlockCached);
			return;
		}

		const historicApi = await rcApi.at(hash);

		// ref: https://github.com/paritytech/substrate-api-sidecar/pull/1830
		// BlockHash and IU8a are the same underlying types
		const block = await this.service.fetchBlock(hash as unknown as BlockHash, historicApi, options);
		this.blockStore.set(cacheKey, block);

		RcBlocksController.sanitizedSend(res, block);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;

		if (res.locals.metrics) {
			this.emitExtrinsicMetrics(block.extrinsics.length, 1, method, path, res);
		}
	};

	private getBlockById: IRequestHandlerWithMetrics<INumberParam, IBlockQueryParams> = async (
		{
			params: { number },
			query: { eventDocs, extrinsicDocs, noFees, finalizedKey, decodedXcmMsgs, paraId },
			method,
			route,
		},
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const checkFinalized = isHex(number);
		const hash = await this.getHashFromAt(number, { api: rcApi });

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';
		const finalizeOverride = finalizedKey === 'false';

		const queryFinalizedHead = !this.options.finalizes ? false : true;
		const noFeesArg = noFees === 'true';
		let omitFinalizedTag = !this.options.finalizes ? true : false;

		if (finalizeOverride) {
			omitFinalizedTag = true;
		}

		const decodedXcmMsgsArg = decodedXcmMsgs === 'true';
		const paraIdArg = paraId ? this.parseNumberOrThrow(paraId, 'paraId must be an integer') : undefined;

		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized,
			queryFinalizedHead,
			omitFinalizedTag,
			noFees: noFeesArg,
			checkDecodedXcm: decodedXcmMsgsArg,
			paraId: paraIdArg,
		};

		const cacheKey = hash.toString() + Object.values(options).join();

		const isBlockCached = this.blockStore.get(cacheKey);

		if (isBlockCached) {
			RcBlocksController.sanitizedSend(res, isBlockCached);
			return;
		}

		const historicApi = await rcApi.at(hash);
		const block = await this.service.fetchBlock(hash, historicApi, options);

		this.blockStore.set(cacheKey, block);

		RcBlocksController.sanitizedSend(res, block);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;
		if (res.locals.metrics) {
			this.emitExtrinsicMetrics(block.extrinsics.length, 1, method, path, res);
		}
	};

	private getBlockHeaderById: RequestHandler<INumberParam, unknown, unknown, IBlockQueryParams> = async (
		{ params: { number } },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(number, { api: rcApi });
		const headerResult = await this.service.fetchBlockHeader(hash);

		RcBlocksController.sanitizedSend(res, headerResult);
	};

	private getLatestBlockHeader: RequestHandler = async ({ query: { finalized } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const paramFinalized = finalized !== 'false';
		const hash = paramFinalized ? await rcApi.rpc.chain.getFinalizedHead() : undefined;

		const headerResult = await this.service.fetchBlockHeader(hash);

		RcBlocksController.sanitizedSend(res, headerResult);
	};

	private getBlocks: IRequestHandlerWithMetrics<unknown, IRangeQueryParam & IBlockQueryParams> = async (
		{ query: { range, eventDocs, extrinsicDocs, noFees }, method, route },
		res,
	): Promise<void> => {
		if (!range) throw new BadRequest('range query parameter must be inputted.');

		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const rangeOfNums = this.parseRangeOfNumbersOrThrow(range, 500);

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';
		const queryFinalizedHead = !this.options.finalizes ? false : true;
		const omitFinalizedTag = !this.options.finalizes ? true : false;
		const noFeesArg = noFees === 'true';
		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized: false,
			queryFinalizedHead,
			omitFinalizedTag,
			noFees: noFeesArg,
			checkDecodedXcm: false,
			paraId: undefined,
		};

		const pQueue = new PromiseQueue(4);
		const blocksPromise: Promise<unknown>[] = [];

		for (let i = 0; i < rangeOfNums.length; i++) {
			const result = pQueue.run(async () => {
				const hash = await this.getHashFromAt(rangeOfNums[i].toString(), { api: rcApi });
				const historicApi = await rcApi.at(hash);
				return await this.service.fetchBlock(hash, historicApi, options);
			});
			blocksPromise.push(result);
		}

		const allBlocks = await Promise.all(blocksPromise);
		blocksPromise.length = 0;

		const blocks = allBlocks as IBlock[];

		blocks.sort((a, b) => a.number.toNumber() - b.number.toNumber());

		RcBlocksController.sanitizedSend(res, blocks);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;
		if (res.locals.metrics) {
			const totExtrinsics = blocks.reduce((current: number, block) => {
				const extrinsics = block.extrinsics;

				if (Array.isArray(extrinsics)) {
					return current + extrinsics.length;
				}

				return current;
			}, 0);
			this.emitExtrinsicMetrics(totExtrinsics, blocks.length, method, path, res);
		}
	};
}
