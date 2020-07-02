import { ApiPromise } from '@polkadot/api';
import { Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import AbstractController from './AbstractController';

/**
 * GET the chain's metadata.
 *
 * Paths:
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - Metadata object.
 *
 * Substrate Reference:
 * - FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
 * - Knowledge Base: https://substrate.dev/docs/en/knowledgebase/runtime/metadata
 */
export default class MetadataController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/metadata');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['', this.getLatestMetadata],
			['/:number', this.getMetadataAtBlock],
		]);
	}

	private getLatestMetadata = async (
		_req: Request,
		res: Response
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		res.send(await this.handler.fetchMetadata(hash));
	};

	private getMetadataAtBlock = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { number } = req.params;
		const hash = await this.getHashForBlock(number);

		res.send(await this.handler.fetchMetadata(hash));
	};
}
