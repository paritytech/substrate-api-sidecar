import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { INumberParam } from 'src/types/requests';

import { TransactionMaterialService } from '../../services';
// import ApiHandler from '../ApiHandler';
import AbstractController from '../AbstractController';

/**
 * GET all the information needed to construct a transaction offline.
 *
 * Paths
 * - (Optional) `number`: Block hash or number at which to query. If not provided, queries
 *   finalized head.
 *
 * Query
 * - (Optional) `noMeta`: If true, does not return metadata hex. This is useful when metadata is not
 * needed and response time is a concern. Defaults to false.
 *
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `genesisHash`: The hash of the chain's genesis block.
 * - `chainName`: The chain's name.
 * - `specName`: The chain's spec.
 * - `specVersion`: The spec version. Always increased in a runtime upgrade.
 * - `txversion`: The transaction version. Common `txVersion` numbers indicate that the
 *   transaction encoding format and method indices are the same. Needed for decoding in an
 *   offline environment. Adding new transactions does not change `txVersion`.
 * - `metadata`: The chain's metadata in hex format.
 *
 * Note: `chainName`, `specName`, and `specVersion` are used to define a type registry with a set
 * of signed extensions and types. For Polkadot and Kusama, `chainName` is not used in defining
 * this registry, but in other Substrate-based chains that re-launch their network without
 * changing the `specName`, the `chainName` would be needed to create the correct registry.
 *
 * Substrate Reference:
 * - `RuntimeVersion`: https://crates.parity.io/sp_version/struct.RuntimeVersion.html
 * - `SignedExtension`: https://crates.parity.io/sp_runtime/traits/trait.SignedExtension.html
 * - FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
 */
export default class TransactionMaterialController extends AbstractController<
	TransactionMaterialService
> {
	constructor(api: ApiPromise) {
		super(api, '/tx/artifacts', new TransactionMaterialService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['', this.getTxArtifacts],
			['/:number', this.getTxArtifactsAtBlock],
		]);
	}

	/**
	 * Get generic offline transaction construction material.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getTxArtifacts: RequestHandler = async (
		{ query: { noMeta } },
		res
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();

		const noMetaArg = noMeta === 'true' ? noMeta : undefined;

		TransactionMaterialController.sanitizedSend(
			res,
			await this.service.fetchTransactionMaterial(hash, noMetaArg)
		);
	};

	/**
	 * Get generic offline transaction construction material at a block identified
	 * by its hash or number.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getTxArtifactsAtBlock: RequestHandler<INumberParam> = async (
		{ params: { number }, query: { noMeta } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		const noMetaArg = noMeta === 'true' ? noMeta : undefined;

		TransactionMaterialController.sanitizedSend(
			res,
			await this.service.fetchTransactionMaterial(hash, noMetaArg)
		);
	};
}
