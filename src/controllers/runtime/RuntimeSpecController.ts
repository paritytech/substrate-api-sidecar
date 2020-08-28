import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { RuntimeSpecService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * Get version information of the Substrate runtime.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information. Block
 * 		identifier, as the block height or block hash. Defaults to most recent block.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `authoringVersion`: The version of the authorship interface. An authoring node
 *    will not attempt to author blocks unless this is equal to its native runtime.
 * - `chainType`: Type of the chain.
 * - `implVersion`: Version of the implementation specification. Non-consensus-breaking
 * 		optimizations are about the only changes that could be made which would
 * 		result in only the `impl_version` changing. The `impl_version` is set to 0
 * 		when `spec_version` is incremented.
 * - `specName`: Identifies the spec name for the current runtime.
 * - `specVersion`: Version of the runtime specification.
 * - `transactionVersion`: All existing dispatches are fully compatible when this
 * 		number doesn't change. This number must change when an existing dispatchable
 * 		(module ID, dispatch ID) is changed, either through an alteration in its
 * 		user-level semantics, a parameter added/removed/changed, a dispatchable
 * 		its index.
 * - `properties`: Arbitrary properties defined in the chain spec.
 */
export default class RuntimeSpecController extends AbstractController<
	RuntimeSpecService
> {
	constructor(api: ApiPromise) {
		super(api, '/runtime/spec', new RuntimeSpecService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getSpec]]);
	}

	private getSpec: RequestHandler = async ({ query: { at } }, res) => {
		const hash = await this.getHashFromAt(at);

		RuntimeSpecController.sanitizedSend(
			res,
			await this.service.fetchSpec(hash)
		);
	};
}
