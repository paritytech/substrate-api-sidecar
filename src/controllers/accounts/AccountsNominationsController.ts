import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IAddressParam } from 'src/types/requests';

import { validateAddress } from '../../middleware';
import { AccountsNominationsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET all nominations for an address
 *
 * TODO
 */
export default class AccountsIdentityController extends AbstractController<AccountsNominationsService> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/accounts/:address/nominations',
			new AccountsNominationsService(api)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([['', this.listNominations]]);
	}

	/**
	 * List all validators nominated by the requested account.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private listNominations: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		AccountsIdentityController.sanitizedSend(
			res,
			await this.service.fetchNominations(hash, address)
		);
	};
}
