import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { PalletsNominationPoolService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * * GET nomination pool information by pool Id.
 *
 * Paths:
 * - `poolId`: The identifier of the nomination pool.
 *
 * Query Params:
    at: (Optional) blockId or hash (Note: it is important to use api.at for any queries (Not RPC methods), when we want to query at a specific blockHash, we call this the historicApi in Sidecar and you can reference other controllers and services for exampels).
    metadata: (Optional) This will be optional for the user and should be a boolean. So either true or false, and will deefault to false
 */

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

		let metaData = false;

		if (metadata) {
			metaData = metadata === 'true' ? true : false;
		}

		const hash = await this.getHashFromAt(at);

		PalletsNominationPoolController.sanitizedSend(
			res,
			await this.service.fetchNominationPoolById(
				index,
				hash,
				metaData,
			)
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
