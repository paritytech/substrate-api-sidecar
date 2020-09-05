import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { RuntimeMetadataService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET the chain's metadata.
 *
 * Query:
 * - (Optional) `at`: Block hash or height at which to query. If not provided, queries
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
		super(api, '/runtime/metadata', new RuntimeMetadataService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getMetadata]]);
	}

	/**
	 * Get the chain's latest metadata in a decoded, JSON format.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getMetadata: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		RuntimeMetadataController.sanitizedSend(
			res,
			await this.service.fetchMetadata(hash)
		);
	};
}
