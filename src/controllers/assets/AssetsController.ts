import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { AssetsService } from '../../services';
import AbstractController from '../AbstractController';

export default class AssetsController extends AbstractController<AssetsService> {
	constructor(api: ApiPromise) {
		super(api, '/assets', new AssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:assetsId/asset-info', this.getAssetById],
		]);
	}

	private getAssetById: RequestHandler = async (
		{ params: { assetId }, query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);
		/**
		 * Verify our param `assetId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(
			assetId,
			'`assetId` path param is not a number'
		);

		AssetsController.sanitizedSend(
			res,
			this.service.fetchAssetById(hash, index)
		);
	};
}
