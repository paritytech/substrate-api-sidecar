import { ApiPromise } from '@polkadot/api';
import { Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import { validateAddressMiddleware } from '../middleware/validations_middleware';
import AbstractController from './AbstractController';

export default class VestingController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/vesting/:address');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router
			.use(this.path, validateAddressMiddleware)
			.get(this.path, this.catchWrap(this.getLatestAccountVestingSummary))
			.get(
				`${this.path}/:number`,
				this.catchWrap(this.getAccountVestingSummaryAtBlock)
			);
	}

	private getLatestAccountVestingSummary = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		res.send(await this.handler.fetchVesting(hash, address));
	};

	private getAccountVestingSummaryAtBlock = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { address, number } = req.params;
		const hash = await this.getHashForBlock(number);

		res.send(await this.handler.fetchVesting(hash, address));
	};
}
