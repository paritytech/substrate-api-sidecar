import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { RuntimeConstantsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * Get blockchain constants of the Substrate runtime.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime constants information. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `consts`: The constants for queried block.
 */
export default class RuntimeConstantsController extends AbstractController<RuntimeConstantsService> {
	constructor(api: ApiPromise) {
		super(api, '/runtime/constants', new RuntimeConstantsService(api)); // TODO
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getConstants]]);
	}

	private getConstants: RequestHandler = async ({ query: { at } }, res) => {
		const hash = await this.getHashFromAt(at);

		RuntimeConstantsController.sanitizedSend(
			res,
			await this.service.fetchConstants(hash)
		);
	};
}
