import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { NodeVersionService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET information about the Substrates node's implementation and versioning.
 *
 * Returns:
 * - `clientVersion`: Node binary version.
 * - `clientImplName`: Node's implementation name.
 * - `chain`: Node's chain name.
 */
export default class NodeVersionController extends AbstractController<
	NodeVersionService
> {
	constructor(api: ApiPromise) {
		super(api, '/node/version', new NodeVersionService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeVersion]]);
	}

	/**
	 * GET information about the Substrates node's implementation and versioning.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	getNodeVersion: RequestHandler = async (_req, res): Promise<void> => {
		NodeVersionController.sanitizedSend(
			res,
			await this.service.fetchVersion()
		);
	};
}
