import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressNumberParams, IAddressParam } from 'src/types/requests';

import { validateAddress } from '../../middleware/';
import { AccountsStakingInfoService } from '../../services';
import AbstractController from '../AbstractController';

export default class AccountsStakingInfoController extends AbstractController<
	AccountsStakingInfoService
> {
	constructor(api: ApiPromise) {
		super(api, '/staking/:address', new AccountsStakingInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

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
		{ params: { address } },
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		AccountsStakingInfoController.sanitizedSend(
			res,
			await this.service.fetchAccountStakingInfo(hash, address)
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

		AccountsStakingInfoController.sanitizedSend(
			res,
			await this.service.fetchAccountStakingInfo(hash, address)
		);
	};
}
