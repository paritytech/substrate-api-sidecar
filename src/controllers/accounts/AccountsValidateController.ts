import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { AccountsValidateService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class ValidateAddressController extends AbstractController<AccountsValidateService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/validate', new AccountsValidateService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.validateAddress]]);
	}

	private validateAddress: RequestHandler = ({ params: { address } }, res) => {
		ValidateAddressController.sanitizedSend(
			res,
			this.service.validateAddress(address)
		);
	};
}
