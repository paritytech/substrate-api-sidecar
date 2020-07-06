import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { AddressNumberParams, AddressParam } from 'src/types/request_types';

import ApiHandler from '../ApiHandler';
import { validateAddressMiddleware } from '../middleware/validations_middleware';
import AbstractController from './AbstractController';

/**
 * GET balance information for an address.
 *
 * Paths:
 * - `address`: The address to query.
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `nonce`: Account nonce.
 * - `free`: Free balance of the account. Not equivalent to _spendable_ balance. This is the only
 *   balance that matters in terms of most operations on tokens.
 * - `reserved`: Reserved balance of the account.
 * - `miscFrozen`: The amount that `free` may not drop below when withdrawing for anything except
 *   transaction fee payment.
 * - `feeFrozen`: The amount that `free` may not drop below when withdrawing specifically for
 *   transaction fee payment.
 * - `locks`: Array of locks on a balance. There can be many of these on an account and they
 *   "overlap", so the same balance is frozen by multiple locks. Contains:
 *   - `id`: An identifier for this lock. Only one lock may be in existence for each identifier.
 *   - `amount`: The amount below which the free balance may not drop with this lock in effect.
 *   - `reasons`: If true, then the lock remains in effect even for payment of transaction fees.
 *
 * Substrate Reference:
 * - FRAME System: https://crates.parity.io/frame_system/index.html
 * - Balances Pallet: https://crates.parity.io/pallet_balances/index.html
 * - `AccountInfo`: https://crates.parity.io/frame_system/struct.AccountInfo.html
 * - `AccountData`: https://crates.parity.io/pallet_balances/struct.AccountData.html
 * - `BalanceLock`: https://crates.parity.io/pallet_balances/struct.BalanceLock.html
 */
export default class BalancesController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/balance/:address');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddressMiddleware);

		this.safeMountAsyncGetHandlers([
			['', this.getAccountBalanceSummary],
			['/:number', this.getAccountBalanceSummaryAtBlock],
		]);
	}

	/**
	 * Get the latest account balance summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountBalanceSummary: RequestHandler<AddressParam> = async (
		req,
		res
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		BalancesController.sanitizedSend(
			res,
			await this.handler.fetchBalance(hash, address)
		);
	};

	/**
	 * Get the account balance summary of `address` at a block identified by its
	 * hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountBalanceSummaryAtBlock: RequestHandler<
		AddressNumberParams
	> = async (req, res): Promise<void> => {
		const { number, address } = req.params;
		const hash = await this.getHashForBlock(number);

		BalancesController.sanitizedSend(
			res,
			await this.handler.fetchBalance(hash, address)
		);
	};
}
