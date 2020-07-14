import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressNumberParams, IAddressParam } from 'src/types/requests';

import { ClaimsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET the claims type for an Ethereum address.
 *
 * Paths:
 * - `ethAddress`: The _Ethereum_ address that holds a DOT claim.
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Returns:
 * - `type`: The type of claim. 'Regular' or 'Saft'.
 *
 * Reference:
 * - Claims Guide: https://wiki.polkadot.network/docs/en/claims
 */
export default class ClaimsController extends AbstractController<
	ClaimsService
> {
	constructor(api: ApiPromise) {
		super(api, '/claims/:address', new ClaimsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['', this.getClaim],
			['/:number', this.getClaimAtBlock],
		]);
	}

	/**
	 * Get information on a claim by ethereum `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getClaim: RequestHandler<IAddressParam> = async (
		req,
		res
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		ClaimsController.sanitizedSend(
			res,
			await this.service.fetchClaimsInfo(hash, address)
		);
	};

	/**
	 * Get information on a claim by ethereum `address` at a block identified by
	 * its hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getClaimAtBlock: RequestHandler<IAddressNumberParams> = async (
		{ params: { number, address } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		ClaimsController.sanitizedSend(
			res,
			await this.service.fetchClaimsInfo(hash, address)
		);
	};
}
