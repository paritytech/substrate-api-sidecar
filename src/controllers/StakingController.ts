import { ApiPromise } from '@polkadot/api';
import { NextFunction, Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import { validateAddressMiddleware } from '../middleware/validations_middleware';
import AbstractController from './AbstractController';

export default class BlocksController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/staking/:address');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router
			.use(validateAddressMiddleware)
			.get(this.path, this.getLatestAccountStakingSummary)
			.get(`${this.path}/:number`, this.getAccountStakingSummaryAtBlock);
	}

	private getLatestAccountStakingSummary = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		try {
			res.send(await this.handler.fetchAddressStakingInfo(hash, address));
		} catch (e) {
			console.log(e);
		}
	};

	private getAccountStakingSummaryAtBlock = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { address, number } = req.params;

		try {
			const hash = await this.getHashForBlock(number);
			res.send(await this.handler.fetchAddressStakingInfo(hash, address));
		} catch (e) {
			return next(e);
		}
	};
}
