import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { BadRequest, InternalServerError } from 'http-errors';

import { validateAddress } from '../../middleware';
import { AccountsStakingPayoutsService } from '../../services/';
import { IAddressParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class AccountsStakingPayoutsController extends AbstractController<
	AccountsStakingPayoutsService
> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/accounts/:address/staking-payouts',
			new AccountsStakingPayoutsService(api)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([
			['', this.getStakingPayoutsByAccountId],
		]);
	}

	/**
	 * Get the payouts of `address` for `depth` starting from the `era`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getStakingPayoutsByAccountId: RequestHandler<
		IAddressParam
	> = async (
		{ params: { address }, query: { depth, era, unclaimedOnly } },
		res
	): Promise<void> => {
		const { hash, eraArg, currentEra } = await this.getEraAndHash(
			this.verifyAndCastOr('era', era, undefined)
		);

		const unclaimedOnlyArg = unclaimedOnly === 'false' ? false : true;

		AccountsStakingPayoutsController.sanitizedSend(
			res,
			await this.service.fetchAccountStakingPayout(
				hash,
				address,
				this.verifyAndCastOr('depth', depth, 1) as number,
				eraArg,
				unclaimedOnlyArg,
				currentEra
			)
		);
	};

	private async getEraAndHash(era?: number) {
		const [hash, activeEraOption, currentEraOption] = await Promise.all([
			this.api.rpc.chain.getFinalizedHead(),
			this.api.query.staking.activeEra(),
			this.api.query.staking.currentEra(),
		]);

		if (activeEraOption.isNone) {
			throw new InternalServerError(
				'ActiveEra is None when Some was expected'
			);
		}
		const activeEra = activeEraOption.unwrap().index.toNumber();

		if (currentEraOption.isNone) {
			throw new InternalServerError(
				'CurrentEra is None when Some was expected'
			);
		}
		const currentEra = currentEraOption.unwrap().toNumber();

		if (era && era > activeEra - 1) {
			throw new BadRequest(
				`The specified era (${era}) is too large. ` +
					`Largest era payout info is available for is ${
						activeEra - 1
					}`
			);
		}

		return { hash, eraArg: era ? era : activeEra - 1, currentEra };
	}
}
