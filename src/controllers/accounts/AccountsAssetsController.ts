import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { validateAddress } from '../../middleware';
import { AccountsAssetsService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class AccountsAssetsController extends AbstractController<AccountsAssetsService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/', new AccountsAssetsService(api));
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress);

		this.safeMountAsyncGetHandlers([
			['asset-balances', this.getAssetBalances],
			['asset-approvals', this.getAssetApprovals],
		]);
	}

	private getAssetBalances: RequestHandler = async (
		{ params: { address }, query: { at, assets } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const assetsArray = Array.isArray(assets) 
		     ? this.parseQueryParamArrayOrThrow(
				assets,
				'assets query parameter is not in the correct format.'
			)
		    : [ ];	

		AccountsAssetsController.sanitizedSend(
			res,
			await this.service.fetchAssetBalances(hash, address, assetsArray)
		);
	};

	private getAssetApprovals: RequestHandler = async (
		{ params: { address }, query: { at, delegate, assetId } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		if (typeof delegate !== 'string' || typeof assetId !== 'string') {
			throw new BadRequest(
				'Must include a `delegate` and `assetId` query param'
			);
		}

		const id = this.parseNumberOrThrow(
			assetId,
			'`assetId` provided is not a number.'
		);

		AccountsAssetsController.sanitizedSend(
			res,
			await this.service.fetchAssetApproval(hash, address, id, delegate)
		);
	};
}
