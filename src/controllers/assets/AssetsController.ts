import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { AssetsService } from 'src/services/assets/AssetsService';

import AbstractController from '../AbstractController';

export default class AssetsController extends AbstractController<AssetsService> {
	constructor(api: ApiPromise) {
		super(api, '/assets/', new AssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:assetsId/assetInfo', this.getAssetById],
		]);
	}

	private getAssetById: RequestHandler = async (
		{ params: { assetId }, query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);
		/**
		 * Verify our param `assetId` is an integer represented as a string
		 */
		this.parseNumberOrThrow(
			assetId,
			'`assetId` path param is not a number'
		);

		/**
		 * Change assetId from a type string to a number before passing it
		 * into any service.
		 */
		const index = parseInt(assetId, 10);

		AssetsController.sanitizedSend(
			res,
			this.service.fetchAssetById(hash, index)
		);
	};
}
