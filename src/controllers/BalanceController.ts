import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import BaseController from './BaseController';

export default class BlocksController extends BaseController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/balance/:address');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router
			.get(this.path, this.getLatestAccountBalance)
			.get(`${this.path}/:number`, this.getAccountBalanceAtBlock);
	}

	private getLatestAccountBalance = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();
		const { address } = req.params;

		res.send(await this.handler.fetchBalance(hash, address));
	};

	private getAccountBalanceAtBlock = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { number, address } = req.params;
		const hash: BlockHash = await this.getHashForBlock(number);
		res.send(await this.handler.fetchBalance(hash, address));
	};
}
