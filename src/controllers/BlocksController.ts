import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { Request, Response } from 'express';
import ApiHandler from 'src/ApiHandler';

import { createValidateHeightMiddleware } from '../middleware/validations.middleware';
import BaseController from './BaseController';

export default class BlocksController extends BaseController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super();
		this.handler = new ApiHandler(api);
		this.api = api;
		this.initRoutes();
	}

	initRoutes(): void {
		this.router
			.get(this.path, this.latestBlock)
			.get(
				`${this.path}/:number`,
				createValidateHeightMiddleware(this.api),
				this.identifiedBlock
			);
	}

	latestBlock = async (_req: Request, res: Response): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();
		res.send(await this.handler.fetchBlock(hash));
	};

	identifiedBlock = async (req: Request, res: Response): Promise<void> => {
		const hash: BlockHash = await this.getHashForBlock(req.params.number);
		res.json(await this.handler.fetchBlock(hash));
	};
}
