import { ApiPromise } from '@polkadot/api';
import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

import { PalletsStorageItemService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsStorageItemController extends AbstractController<
	PalletsStorageItemService
> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/pallets/:palletId/storage',
			new PalletsStorageItemService(api)
		);

		this.initRoutes();
	}

	protected initRoutes(): void {
		// TODO in future PR, look into middleware validation of storageId and palletId
		this.safeMountAsyncGetHandlers([
			['/:storageItemId', this.getStorageItem],
		]);
	}

	private getStorageItem: RequestHandler = async (
		{
			query: { at, key1, key2, metadata },
			params: { palletId, storageItemId },
		},
		res
	): Promise<void> => {
		const key1Arg = typeof key1 === 'string' ? key1 : undefined;
		const key2Arg = typeof key2 === 'string' ? key2 : undefined;
		const metadataArg = metadata === 'true' ? true : false;

		const hash = await this.getHashFromAt(at);

		PalletsStorageItemController.sanitizedSend(
			res,
			await this.service.fetchStorageItem({
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				storageItemId: stringCamelCase(storageItemId),
				key1: key1Arg,
				key2: key2Arg,
				metadata: metadataArg,
			})
		);
	};
}
