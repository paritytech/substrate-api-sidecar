import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { validateAddress } from '../../middleware';
import AbstractController from '../AbstractController';
import { AccountsAssetsService } from '../../services/accounts'

export default class AccountsAssetsController extends AbstractController<AccountsAssetsService> {
    constructor(api: ApiPromise) {
        super(
            api,
            '/accounts/:address/',
            new AccountsAssetsService(api)
        )
    }

    protected initRoutes(): void {
        this.router.use(this.path, validateAddress);

        this.safeMountAsyncGetHandlers([[
            'asset-balances', this.getAssetBalances
        ]]);
    }

    private getAssetBalances: RequestHandler = async (
        { params: { address }, query: { at, assetId } },
        res
    ): Promise<void> => {
        const hash = await this.getHashFromAt(at);

        if (typeof assetId === 'string') {
            this.parseNumberOrThrow(
                assetId,
                '`assetId` path param is not a number'
            );
        }

        AccountsAssetsController.sanitizedSend(
            res,
            await this.service
        )
    }
}
