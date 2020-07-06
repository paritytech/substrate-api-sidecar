import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { NumberParam } from 'src/types/request_types';

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
			['', this.getMetadata],
			['/:number', this.getMetadataAtBlock],
		]);
	}

	/**
	 * Get the chain's latest metadata in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */

	private getMetadata: RequestHandler = async (_req, res): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		MetadataController.sanitizedSend(
			res,
			await this.handler.fetchMetadata(hash)
		);
	};

	/**
	 * Get the chain's metadata in a decoded, JSON format at a block identified
	 * by its hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getMetadataAtBlock: RequestHandler<NumberParam> = async (
		req,
		res
	): Promise<void> => {
		const { number } = req.params;
		const hash = await this.getHashForBlock(number);

		MetadataController.sanitizedSend(
			res,
			await this.handler.fetchMetadata(hash)
		);
	};
}
