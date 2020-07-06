import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressNumberParams, IAddressParam } from 'src/types/request_types';

import ApiHandler from '../ApiHandler';
import { validateAddressMiddleware } from '../middleware/validations_middleware';
import AbstractController from './AbstractController';

export default class StakingController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/staking/:address');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddressMiddleware);

		this.safeMountAsyncGetHandlers([
			['', this.getAccountStakingSummary],
			['/:number', this.getAccountStakingSummaryAtBlock],
		]);
	}

	/**
	 * Get the latest account staking summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountStakingSummary: RequestHandler<IAddressParam> = async (
		req,
		res
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		StakingController.sanitizedSend(
			res,
			await this.handler.fetchAddressStakingInfo(hash, address)
		);
	};

	/**
	 * Get the account staking summary of `address` at a block identified by its
	 * hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountStakingSummaryAtBlock: RequestHandler<
		IAddressNumberParams
	> = async (req, res): Promise<void> => {
		const { address, number } = req.params;
		const hash = await this.getHashForBlock(number);

		StakingController.sanitizedSend(
			res,
			await this.handler.fetchAddressStakingInfo(hash, address)
		);
	};
}
