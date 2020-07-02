import { ApiPromise } from '@polkadot/api';
import { Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import AbstractController from './AbstractController';

export default class TxArtifactsController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/tx/artifacts');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['', this.getLatestTxArtifacts],
			['/:number', this.getTxArtifactsAtBlock],
		]);
	}

	private getLatestTxArtifacts = async (
		_req: Request,
		res: Response
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		res.send(await this.handler.fetchTxArtifacts(hash));
	};

	private getTxArtifactsAtBlock = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { number } = req.params;
		const hash = await this.getHashForBlock(number);

		res.send(await this.handler.fetchTxArtifacts(hash));
	};
}
