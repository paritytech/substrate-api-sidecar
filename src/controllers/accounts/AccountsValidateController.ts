import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { ValidateService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class ValidateAddressController extends AbstractController<ValidateService> {
    constructor(api: ApiPromise) {
        super(api, '/accounts/:address/validate', new ValidateService(api))
        this.initRoutes();
    }

    protected initRoutes(): void {
        this.safeMountAsyncGetHandlers([['', this.validateAddress]]);
    }

    private validateAddress: RequestHandler = (
        { params: { address } },
        res
    ) => {
        ValidateAddressController.sanitizedSend(
            res,
            this.service.validateAddress(address),
        )
    }
}
