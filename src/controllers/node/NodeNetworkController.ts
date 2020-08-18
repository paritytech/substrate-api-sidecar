import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { NodeNetworkService } from '../../services';
import AbstractController from '../AbstractController';

export default class NodeNetworkController extends AbstractController<
	NodeNetworkService
> {
	constructor(api: ApiPromise) {
		super(api, '/node/network', new NodeNetworkService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeNetworking]]);
	}

	/**
	 * Get network information of the node.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getNodeNetworking: RequestHandler = async (
		_req,
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		NodeNetworkController.sanitizedSend(
			res,
			await this.service.fetchNetworking(hash)
		);
	};
}
