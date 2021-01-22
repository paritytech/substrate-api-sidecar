import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

interface ControllerOptions {
	finalizes: boolean;
}

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
	constructor(api: ApiPromise, private readonly options: ControllerOptions) {
		super(api, '/blocks/:blockId/extrinsics', new BlocksService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:extrinsicIndex', this.getExtrinsicByExtrsinsicIndex],
		]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getExtrinsicByExtrsinsicIndex: RequestHandler<INumberParam> = async (
		{
			params: { blockId, extrinsicIndex },
			query: { eventDocs, extrinsicDocs },
		},
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';

		const queryFinalizedHead = !this.options.finalizes ? false : true;
		const omitFinalizedTag = !this.options.finalizes ? true : false;

		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized: true,
			queryFinalizedHead,
			omitFinalizedTag,
		};

		const block = await this.service.fetchBlock(hash, options);

		this.parseNumberOrThrow(
			extrinsicIndex,
			'ExstrinsicIndex is not a number'
		);

		// Change extrinsicIndex from a type string to a number before passing it
		// into any service.
		const index = parseInt(extrinsicIndex, 10);

		BlocksExtrinsicsController.sanitizedSend(
			res,
			this.service.fetchExtrinsicByIndex(block, index)
		);
	};
}
