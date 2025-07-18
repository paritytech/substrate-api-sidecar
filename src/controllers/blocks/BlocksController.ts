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
import { isHex } from '@polkadot/util';
import { RequestHandler, Response } from 'express';
import { BadRequest } from 'http-errors';
import type { LRUCache } from 'lru-cache';
import type client from 'prom-client';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { validateBoolean, validateUseRcBlock } from '../../middleware/validate';
import { BlocksService } from '../../services';
import { ControllerOptions } from '../../types/chains-config';
import {
	IBlockQueryParams,
	IMetrics,
	INumberParam,
	IRangeQueryParam,
	IRequestHandlerWithMetrics,
} from '../../types/requests';
import { IBlock } from '../../types/responses';
import { PromiseQueue } from '../../util/PromiseQueue';
import AbstractController from '../AbstractController';

/**
 * GET a block.
 *
 * Paths:
 * - `head`: Get the latest finalized block.
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Query:
 * - (Optional) `eventDocs`: When set to `true`, every event will have an extra
 * 	`docs` property with a string of the events documentation.
 * - (Optional) `extrinsicDocs`: When set to `true`, every extrinsic will have an extra
 * 	`docs` property with a string of the extrinsics documentation.
 * - (Optional for `/blocks/head`) `finalized`: When set to `false`, it will fetch the head of
 * 	the node's canon chain, which might not be finalized. When set to `true` it
 * 	will fetch the head of the finalized chain.
 * - (Optional) `noFees`: When set to `true`, it will not calculate the fee for each extrinsic.
 * - (Optional for `/blocks/{blockId}`) `decodedXcmMsgs`: When set to `true`, it will show the
 *  decoded XCM messages within the extrinsics of the requested block.
 * - (Optional for `/blocks/{blockId}) `paraId`: When it is set, it will return only the decoded
 *  XCM messages for the specified paraId/parachain Id. To activate this functionality, ensure
 *  that the `decodedXcmMsgs` parameter is set to true.
 * - (Optional for `/blocks/head`) `useRcBlock`: When set to `true`, it will use the latest
 *  relay chain block to determine the corresponding Asset Hub block. Only supported for
 *  Asset Hub endpoints with relay chain API available.
 *
 *
 * Returns:
 * - `number`: Block height.
 * - `hash`: The block's hash.
 * - `parentHash`: The hash of the parent block.
 * - `stateRoot`: The state root after executing this block.
 * - `extrinsicsRoot`: The Merkle root of the extrinsics.
 * - `authorId`: The account ID of the block author (may be undefined for some chains).
 * - `logs`: Array of `DigestItem`s associated with the block.
 * - `onInitialize`: Object with an array of `SanitizedEvent`s that occurred during block
 *   initialization with the `method` and `data` for each.
 * - `extrinsics`: Array of extrinsics (inherents and transactions) within the block. Each
 *   contains:
 *   - `method`: Extrinsic method.
 *   - `signature`: Object with `signature` and `signer`, or `null` if unsigned.
 *   - `nonce`: Account nonce, if applicable.
 *   - `args`: Array of arguments. Note: if you are expecting an [`OpaqueCall`](https://substrate.dev/rustdocs/v2.0.0/pallet_multisig/type.OpaqueCall.html)
 * 			and it is not decoded in the response (i.e. it is just a hex string), then Sidecar was not
 * 			able to decode it and likely that it is not a valid call for the runtime.
 *   - `tip`: Any tip added to the transaction.
 *   - `hash`: The transaction's hash.
 *   - `info`: `RuntimeDispatchInfo` for the transaction. Includes the `partialFee`.
 *   - `events`: An array of `SanitizedEvent`s that occurred during extrinsic execution.
 *   - `success`: Whether or not the extrinsic succeeded.
 *   - `paysFee`: Whether the extrinsic requires a fee. Careful! This field relates to whether or
 *     not the extrinsic requires a fee if called as a transaction. Block authors could insert
 *     the extrinsic as an inherent in the block and not pay a fee. Always check that `paysFee`
 *     is `true` and that the extrinsic is signed when reconciling old blocks.
 * - `onFinalize`: Object with an array of `SanitizedEvent`s that occurred during block
 *   finalization with the `method` and `data` for each.
 * - `decodedXcmMsgs`: An array of the decoded XCM messages found within the extrinsics
 *   of the requested block.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `useRcBlock` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `useRcBlock` parameter is used.
 *
 * Note: Block finalization does not correspond to consensus, i.e. whether the block is in the
 * canonical chain. It denotes the finalization of block _construction._
 *
 * Substrate Reference:
 * - `DigestItem`: https://crates.parity.io/sp_runtime/enum.DigestItem.html
 * - `RawEvent`: https://crates.parity.io/frame_system/enum.RawEvent.html
 * - Extrinsics: https://substrate.dev/docs/en/knowledgebase/learn-substrate/extrinsics
 * - `Extrinsic`: https://crates.parity.io/sp_runtime/traits/trait.Extrinsic.html
 * - `OnInitialize`: https://crates.parity.io/frame_support/traits/trait.OnInitialize.html
 * - `OnFinalize`: https://crates.parity.io/frame_support/traits/trait.OnFinalize.html
 */
export default class BlocksController extends AbstractController<BlocksService> {
	private blockStore: LRUCache<string, IBlock>;
	static controllerName = 'Blocks';
	static requiredPallets = [['System', 'Session']];
	constructor(
		api: string,
		private readonly options: ControllerOptions,
	) {
		super(api, '/blocks', new BlocksService(api, options.minCalcFeeRuntime, options.hasQueryFeeApi));
		this.initRoutes();
		this.blockStore = options.blockStore;
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateBoolean(['eventDocs', 'extrinsicDocs', 'finalized']));
		this.router.use('/head', validateUseRcBlock);
		this.router.use('/head/header', validateUseRcBlock);
		this.router.use('/:number', validateUseRcBlock);
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
	/**
	 * Get the latest block.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getLatestBlock: IRequestHandlerWithMetrics<unknown, IBlockQueryParams> = async (
		{ query: { eventDocs, extrinsicDocs, finalized, noFees, decodedXcmMsgs, paraId, useRcBlock }, method, route },
		res,
	) => {
		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';
		const useRcBlockArg = useRcBlock === 'true';

		let hash, queryFinalizedHead, omitFinalizedTag;
		let rcBlockNumber: string | undefined;
		if (!this.options.finalizes) {
			// If the network chain doesn't finalize blocks, we dont want a finalized tag.
			omitFinalizedTag = true;
			queryFinalizedHead = false;
			if (useRcBlockArg) {
				const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;
				const rcHeader = await rcApi.rpc.chain.getHeader();
				const rcHash = rcHeader.hash;
				rcBlockNumber = rcHeader.number.toString();
				hash = await this.getAhAtFromRcAt(rcHash);
			} else {
				hash = (await this.api.rpc.chain.getHeader()).hash;
			}
		} else if (finalized === 'false') {
			// We query the finalized head to know where the latest finalized block
			// is. It is a way to confirm whether the queried block is less than or
			// equal to the finalized head.
			omitFinalizedTag = false;
			queryFinalizedHead = true;
			if (useRcBlockArg) {
				const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;
				const rcHeader = await rcApi.rpc.chain.getHeader();
				const rcHash = rcHeader.hash;
				rcBlockNumber = rcHeader.number.toString();
				hash = await this.getAhAtFromRcAt(rcHash);
			} else {
				hash = (await this.api.rpc.chain.getHeader()).hash;
			}
		} else {
			omitFinalizedTag = false;
			queryFinalizedHead = false;
			if (useRcBlockArg) {
				const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;
				const rcHash = await rcApi.rpc.chain.getFinalizedHead();
				const rcHeader = await rcApi.rpc.chain.getHeader(rcHash);
				rcBlockNumber = rcHeader.number.toString();
				hash = await this.getAhAtFromRcAt(rcHash);
			} else {
				hash = await this.api.rpc.chain.getFinalizedHead();
			}
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
		// Create a key for the cache that is a concatenation of the block hash and all the query params included in the request
		const cacheKey =
			hash.toString() +
			Number(options.eventDocs) +
			Number(options.extrinsicDocs) +
			Number(options.checkFinalized) +
			Number(options.noFees) +
			Number(options.checkDecodedXcm) +
			Number(options.paraId);

		const isBlockCached = this.blockStore.get(cacheKey);

		if (isBlockCached) {
			if (rcBlockNumber) {
				const apiAt = await this.api.at(hash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedCachedResult = {
					...isBlockCached,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				BlocksController.sanitizedSend(res, enhancedCachedResult);
			} else {
				BlocksController.sanitizedSend(res, isBlockCached);
			}
			return;
		}

		const historicApi = await this.api.at(hash);

		const block = await this.service.fetchBlock(hash, historicApi, options);
		this.blockStore.set(cacheKey, block);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...block,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			BlocksController.sanitizedSend(res, enhancedResult);
		} else {
			BlocksController.sanitizedSend(res, block);
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;

		if (res.locals.metrics) {
			this.emitExtrinsicMetrics(block.extrinsics.length, 1, method, path, res);
		}
	};

	/**
	 * Get a block by its hash or number identifier.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getBlockById: IRequestHandlerWithMetrics<INumberParam, IBlockQueryParams> = async (
		{
			params: { number },
			query: { eventDocs, extrinsicDocs, noFees, finalizedKey, decodedXcmMsgs, paraId, useRcBlock },
			method,
			route,
		},
		res,
	): Promise<void> => {
		const useRcBlockArg = useRcBlock === 'true';
		const checkFinalized = isHex(number);

		let hash;
		let rcBlockNumber: string | undefined;

		if (useRcBlockArg) {
			// Treat the 'number' parameter as a relay chain block identifier
			rcBlockNumber = number;
			hash = await this.getAhAtFromRcAt(number);
		} else {
			hash = await this.getHashForBlock(number);
		}

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

		// Create a key for the cache that is a concatenation of the block hash and all the query params included in the request

		const cacheKey =
			hash.toString() +
			Number(options.eventDocs) +
			Number(options.extrinsicDocs) +
			Number(options.checkFinalized) +
			Number(options.noFees) +
			Number(options.checkDecodedXcm) +
			Number(options.paraId);

		const isBlockCached = this.blockStore.get(cacheKey);

		if (isBlockCached) {
			if (rcBlockNumber) {
				const apiAt = await this.api.at(hash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedCachedResult = {
					...isBlockCached,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				BlocksController.sanitizedSend(res, enhancedCachedResult);
			} else {
				BlocksController.sanitizedSend(res, isBlockCached);
			}
			return;
		}
		// HistoricApi to fetch any historic information that doesnt include the current runtime
		const historicApi = await this.api.at(hash);
		const block = await this.service.fetchBlock(hash, historicApi, options);

		this.blockStore.set(cacheKey, block);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...block,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			BlocksController.sanitizedSend(res, enhancedResult);
		} else {
			// We set the last param to true because we haven't queried the finalizedHead
			BlocksController.sanitizedSend(res, block);
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;
		if (res.locals.metrics) {
			this.emitExtrinsicMetrics(block.extrinsics.length, 1, method, path, res);
		}
	};

	/**
	 * Return the Header of the identified block.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getBlockHeaderById: RequestHandler<INumberParam> = async ({ params: { number } }, res): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		BlocksController.sanitizedSend(res, await this.service.fetchBlockHeader(hash));
	};

	/**
	 * Return the header of the latest block
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getLatestBlockHeader: RequestHandler = async ({ query: { finalized, useRcBlock } }, res): Promise<void> => {
		const paramFinalized = finalized !== 'false';
		const useRcBlockArg = useRcBlock === 'true';

		let hash;
		let rcBlockNumber: string | undefined;

		if (useRcBlockArg) {
			const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;
			if (paramFinalized) {
				const rcHash = await rcApi.rpc.chain.getFinalizedHead();
				const rcHeader = await rcApi.rpc.chain.getHeader(rcHash);
				rcBlockNumber = rcHeader.number.toString();
				hash = await this.getAhAtFromRcAt(rcHash);
			} else {
				const rcHeader = await rcApi.rpc.chain.getHeader();
				const rcHash = rcHeader.hash;
				rcBlockNumber = rcHeader.number.toString();
				hash = await this.getAhAtFromRcAt(rcHash);
			}
		} else {
			hash = paramFinalized ? await this.api.rpc.chain.getFinalizedHead() : undefined;
		}

		const headerResult = await this.service.fetchBlockHeader(hash);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash as BlockHash);
			const ahTimestamp = await apiAt.query.timestamp.now();
			const enhancedResult = {
				parentHash: headerResult.parentHash,
				number: headerResult.number,
				stateRoot: headerResult.stateRoot,
				extrinsicsRoot: headerResult.extrinsicsRoot,
				digest: headerResult.digest,
				rcBlockNumber,
				ahTimestamp,
			};

			BlocksController.sanitizedSend(res, enhancedResult);
		} else {
			BlocksController.sanitizedSend(res, headerResult);
		}
	};

	/**
	 * Return a collection of blocks, given a range.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getBlocks: IRequestHandlerWithMetrics<unknown, IRangeQueryParam> = async (
		{ query: { range, eventDocs, extrinsicDocs, noFees }, method, route },
		res,
	): Promise<void> => {
		if (!range) throw new BadRequest('range query parameter must be inputted.');

		// We set a max range to 500 blocks.
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
				// Get block hash:
				const hash = await this.getHashForBlock(rangeOfNums[i].toString());
				// Get API at that hash:
				const historicApi = await this.api.at(hash);
				// Get block details using this API/hash:
				return await this.service.fetchBlock(hash, historicApi, options);
			});
			blocksPromise.push(result);
		}

		const blocks = (await Promise.all(blocksPromise)) as IBlock[];
		blocksPromise.length = 0;
		/**
		 * Sort blocks from least to greatest.
		 */
		blocks.sort((a, b) => a.number.toNumber() - b.number.toNumber());

		BlocksController.sanitizedSend(res, blocks);
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
