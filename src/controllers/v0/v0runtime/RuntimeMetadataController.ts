import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { INumberParam } from 'src/types/requests';

import { RuntimeMetadataService } from '../../../services/v0';
import AbstractController from '../../AbstractController';

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
export default class RuntimeMetadataController extends AbstractController<
	RuntimeMetadataService
> {
	constructor(api: ApiPromise) {
		super(api, '/metadata', new RuntimeMetadataService(api));
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

		RuntimeMetadataController.sanitizedSend(
			res,
			await this.service.fetchMetadata(hash)
		);
	};

	/**
	 * Get the chain's metadata in a decoded, JSON format at a block identified
	 * by its hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getMetadataAtBlock: RequestHandler<INumberParam> = async (
		{ params: { number } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		RuntimeMetadataController.sanitizedSend(
			res,
			await this.service.fetchMetadata(hash)
		);
	};
}
