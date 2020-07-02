import { ApiPromise } from '@polkadot/api';
import { Request, Response } from 'express';

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
			['', this.getClaimByEtheAddress],
			['/:number', this.getClaimByEtheAddressAtBlock],
		]);
	}

	private getClaimByEtheAddress = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { ethAddress } = req.params;
		const hash = await this.api.rpc.chain.getFinalizedHead();

		res.send(await this.handler.fetchClaimsInfo(hash, ethAddress));
	};

	private getClaimByEtheAddressAtBlock = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { number, ethAddress } = req.params;

		const hash = await this.getHashForBlock(number);
		res.send(await this.handler.fetchClaimsInfo(hash, ethAddress));
	};
}
