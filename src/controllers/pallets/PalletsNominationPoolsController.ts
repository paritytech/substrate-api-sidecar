import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { PalletsNominationPoolService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsNominationPoolController extends AbstractController<PalletsNominationPoolService> {
	constructor(api: ApiPromise) {
		super(
			api,
			'/pallets/nominationPools',
			new PalletsNominationPoolService(api)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/info', this.getNominationPoolInfo],
			['/:poolId', this.getNominationPoolById],
		]);
	}

	private getNominationPoolById: RequestHandler = async (
		{ params: { poolId }, query: { at, metadata } },
		res
	): Promise<void> => {
		/**
		 * Verify our param `poolId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(
			poolId,
			'`poolId` path param is not a number'
		);

		const metadataArg = metadata === 'true';

		const hash = await this.getHashFromAt(at);

		PalletsNominationPoolController.sanitizedSend(
			res,
			await this.service.fetchNominationPoolById(index, hash, metadataArg)
		);
	};

	private getNominationPoolInfo: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		PalletsNominationPoolController.sanitizedSend(
			res,
			await this.service.fetchNominationPoolInfo(hash)
		);
	};
}
