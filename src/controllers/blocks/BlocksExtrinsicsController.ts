import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
	constructor(api: ApiPromise) {
		super(api, '/blocks/:blockId/extrinsics', new BlocksService(api));
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

		const block = await this.service.fetchBlock(hash, options);

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
