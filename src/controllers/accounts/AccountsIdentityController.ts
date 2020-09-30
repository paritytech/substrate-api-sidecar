import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressParam } from 'src/types/requests';

import { validateAddress } from '../../middleware';
import { IdentitiesService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET identity for an address.
 *
 * TODO
 */
export default class AccountsIdentityController extends AbstractController<IdentitiesService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/identity', new IdentitiesService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([['', this.getAccountBalanceInfo]]);
	}

	/**
	 * Get the latest account balance summary of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountBalanceInfo: RequestHandler<IAddressParam> = async (
		{ params: { address } },
		res
	): Promise<void> => {
		AccountsIdentityController.sanitizedSend(
			res,
			await this.service.fetchIdentity(address)
		);
	};
}
