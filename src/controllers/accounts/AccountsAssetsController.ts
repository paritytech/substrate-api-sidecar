import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { validateAddress } from '../../middleware';
import { AccountsAssetsService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class AccountsAssetsController extends AbstractController<AccountsAssetsService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/', new AccountsAssetsService(api));
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([['asset-balances', this.getAssetBalances]]);
	}

	private getAssetBalances: RequestHandler = async (
		{ params: { address }, query: { at, assets } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		let assetsArray: number[] = [];

		if (typeof assets === 'string') {
			assetsArray = this.parseQueryParamArrayOrThrow(
				assets,
				'assets query parameter is not in the correct format.'
			);
		}

		AccountsAssetsController.sanitizedSend(
			res,
			await this.service.fetchAssetBalances(hash, address, assetsArray)
		);
	};
}
