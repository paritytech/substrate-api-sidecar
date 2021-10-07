import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import LRU from 'lru-cache';
import { BlockWeightStore } from 'src/types/chains-config';
import { IBlock } from 'src/types/responses';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

interface ControllerOptions {
	blockWeightStore: BlockWeightStore;
	minCalcFeeRuntime: null | number;
	blockStore: LRU<string, IBlock>;
}

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
	constructor(api: ApiPromise, options: ControllerOptions) {
		super(
			api,
			'/blocks/:blockId/extrinsics',
			new BlocksService(
				api,
				options.minCalcFeeRuntime,
				options.blockStore,
				options.blockWeightStore
			)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:extrinsicIndex', this.getExtrinsicByTimepoint],
		]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getExtrinsicByTimepoint: RequestHandler<INumberParam> = async (
		{
			params: { blockId, extrinsicIndex },
			query: { eventDocs, extrinsicDocs },
		},
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';

		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized: true,
			queryFinalizedHead: false,
			omitFinalizedTag: true,
		};

		const historicApi = await this.api.at(hash);

		const block = await this.service.fetchBlock(hash, historicApi, options);

		/**
		 * Verify our param `extrinsicIndex` is an integer represented as a string
		 */
		this.parseNumberOrThrow(
			extrinsicIndex,
			'`exstrinsicIndex` path param is not a number'
		);

		/**
		 * Change extrinsicIndex from a type string to a number before passing it
		 * into any service.
		 */
		const index = parseInt(extrinsicIndex, 10);

		BlocksExtrinsicsController.sanitizedSend(
			res,
			this.service.fetchExtrinsicByIndex(block, index)
		);
	};
}
