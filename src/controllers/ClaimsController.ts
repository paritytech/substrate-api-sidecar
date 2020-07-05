import { ApiPromise } from '@polkadot/api';
import {
	RequestHandlerAddress,
	RequestHandlerAddressNumber,
} from 'src/types/request_types';

import ApiHandler from '../ApiHandler';
import AbstractController from './AbstractController';

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
export default class ClaimsController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/claims/:address');
		this.handler = new ApiHandler(api);
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
	private getClaim: RequestHandlerAddress = async (
		req,
		res
	): Promise<void> => {
		const { address } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		res.send(await this.handler.fetchClaimsInfo(hash, address));
	};

	/**
	 * Get information on a claim by ethereum `address` at a block identified by
	 * its hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getClaimAtBlock: RequestHandlerAddressNumber = async (
		req,
		res
	): Promise<void> => {
		const { number, address } = req.params;
		const hash = await this.getHashForBlock(number);

		res.send(await this.handler.fetchClaimsInfo(hash, address));
	};
}
