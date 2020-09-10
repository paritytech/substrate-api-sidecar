import { ApiPromise } from '@polkadot/api';
import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

import { PalletsStorageQueryService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsStorageQueryController extends AbstractController<
	PalletsStorageQueryService
> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/pallets/:palletId/storage/:storageId',
			new PalletsStorageQueryService(api)
		);

		this.initRoutes();
	}

	protected initRoutes(): void {
		// TODO in future PR, look into middleware validation of storageId and palletId

		this.safeMountAsyncGetHandlers([['', this.getStorageItem]]);
	}

	private getStorageItem: RequestHandler = async (
		{
			query: { at, key1, key2, metadata },
			params: { palletId, storageId },
		},
		res
	): Promise<void> => {
		const key1Arg = typeof key1 === 'string' ? key1 : undefined;
		const key2Arg = typeof key2 === 'string' ? key2 : undefined;
		const metadataArg = metadata === 'true' ? true : false;

		const hash = await this.getHashFromAt(at);

		PalletsStorageQueryController.sanitizedSend(
			res,
			await this.service.fetchStorageItem(
				hash,
				stringCamelCase(palletId),
				stringCamelCase(storageId),
				key1Arg,
				key2Arg,
				metadataArg,
			)
		);
	};
}
