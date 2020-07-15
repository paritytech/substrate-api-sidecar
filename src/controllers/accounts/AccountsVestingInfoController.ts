import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressNumberParams, IAddressParam } from 'src/types/requests';

import { validateAddress } from '../../middleware';
import { AccountVestingInfoService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET vesting information for an address.
 *
 * Paths:
 * - `address`: Address to query.
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `vesting`: Vesting schedule for an account.
 *   - `locked`: Number of tokens locked at start.
 *   - `perBlock`: Number of tokens that gets unlocked every block after `startingBlock`.
 *   - `startingBlock`: Starting block for unlocking(vesting).
 *
 * Substrate Reference:
 * - Vesting Pallet: https://crates.parity.io/pallet_vesting/index.html
 * - `VestingInfo`: https://crates.parity.io/pallet_vesting/struct.VestingInfo.html
 */
export default class AccountsVestingInfoController extends AbstractController<
	AccountVestingInfoService
> {
	constructor(api: ApiPromise) {
		super(api, '/vesting/:address', new AccountVestingInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([
			['', this.getAccountVestingSummary],
			['/:number', this.getAccountVestingSummaryAtBlock],
		]);
	}

	/**
	 * Get the latest account vesting summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountVestingSummary: RequestHandler<IAddressParam> = async (
		{ params: { address } },
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		AccountsVestingInfoController.sanitizedSend(
			res,
			await this.service.fetchAccountVestingInfo(hash, address)
		);
	};

	/**
	 * Get the account vesting summary of `address` at a block identified by its
	 * hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountVestingSummaryAtBlock: RequestHandler<
		IAddressNumberParams
	> = async (req, res): Promise<void> => {
		const { address, number } = req.params;
		const hash = await this.getHashForBlock(number);

		AccountsVestingInfoController.sanitizedSend(
			res,
			await this.service.fetchAccountVestingInfo(hash, address)
		);
	};
}
