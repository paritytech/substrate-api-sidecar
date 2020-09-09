import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * GET a block.
 *
 * Paths:
 * - `head`: Get the latest finalized block.
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
 *
 * Query:
 * - (Optional) `eventDocs`: When set to `true`, every event will have an extra
 * 	`docs` property with a string of the events documentation.
 * - (Optional) `extrinsicDocs`: When set to `true`, every extrinsic will have an extra
 * 	`docs` property with a string of the extrinsics documentation.
 * - (Optional for `/blocks/head`) `finalized`: When set to `false`, it will fetch the head of
 * 	the node's canon chain, which might not be finalized. When set to `true` it
 * 	will fetch the head of the finalized chain.
 *
 *
 * Returns:
 * - `number`: Block height.
 * - `hash`: The block's hash.
 * - `parentHash`: The hash of the parent block.
 * - `stateRoot`: The state root after executing this block.
 * - `extrinsicsRoot`: The Merkle root of the extrinsics.
 * - `authorId`: The account ID of the block author (may be undefined for some chains).
 * - `logs`: Array of `DigestItem`s associated with the block.
 * - `onInitialize`: Object with an array of `SanitizedEvent`s that occurred during block
 *   initialization with the `method` and `data` for each.
 * - `extrinsics`: Array of extrinsics (inherents and transactions) within the block. Each
 *   contains:
 *   - `method`: Extrinsic method.
 *   - `signature`: Object with `signature` and `signer`, or `null` if unsigned.
 *   - `nonce`: Account nonce, if applicable.
 *   - `args`: Array of arguments.
 *   - `tip`: Any tip added to the transaction.
 *   - `hash`: The transaction's hash.
 *   - `info`: `RuntimeDispatchInfo` for the transaction. Includes the `partialFee`.
 *   - `events`: An array of `SanitizedEvent`s that occurred during extrinsic execution.
 *   - `success`: Whether or not the extrinsic succeeded.
 *   - `paysFee`: Whether the extrinsic requires a fee. Careful! This field relates to whether or
 *     not the extrinsic requires a fee if called as a transaction. Block authors could insert
 *     the extrinsic as an inherent in the block and not pay a fee. Always check that `paysFee`
 *     is `true` and that the extrinsic is signed when reconciling old blocks.
 * - `onFinalize`: Object with an array of `SanitizedEvent`s that occurred during block
 *   finalization with the `method` and `data` for each.
 *
 * Note: Block finalization does not correspond to consensus, i.e. whether the block is in the
 * canonical chain. It denotes the finalization of block _construction._
 *
 * Substrate Reference:
 * - `DigestItem`: https://crates.parity.io/sp_runtime/enum.DigestItem.html
 * - `RawEvent`: https://crates.parity.io/frame_system/enum.RawEvent.html
 * - Extrinsics: https://substrate.dev/docs/en/knowledgebase/learn-substrate/extrinsics
 * - `Extrinsic`: https://crates.parity.io/sp_runtime/traits/trait.Extrinsic.html
 * - `OnInitialize`: https://crates.parity.io/frame_support/traits/trait.OnInitialize.html
 * - `OnFinalize`: https://crates.parity.io/frame_support/traits/trait.OnFinalize.html
 */
export default class BlocksController extends AbstractController<
	BlocksService
> {
	constructor(api: ApiPromise) {
		super(api, '/blocks', new BlocksService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/head', this.getLatestBlock],
			['/:number', this.getBlockById],
		]);
	}

	/**
	 * Get the latest block.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getLatestBlock: RequestHandler = async (
		{ query: { eventDocs, extrinsicDocs, finalized } },
		res
	) => {
		const eventDocsArg = eventDocs === 'true';
		const extrsinsicDocsArg = extrinsicDocs === 'true';

		const hash =
			finalized === 'false'
				? (await this.api.rpc.chain.getHeader()).hash
				: await this.api.rpc.chain.getFinalizedHead();

		BlocksController.sanitizedSend(
			res,
			await this.service.fetchBlock(hash, eventDocsArg, extrsinsicDocsArg)
		);
	};

	/**
	 * Get a block by its hash or number identifier.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getBlockById: RequestHandler<INumberParam> = async (
		{ params: { number }, query: { eventDocs, extrinsicDocs } },
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(number);

		const eventDocsArg = eventDocs === 'true';
		const extrinsinsicDocsArg = extrinsicDocs === 'true';

		BlocksController.sanitizedSend(
			res,
			await this.service.fetchBlock(
				hash,
				eventDocsArg,
				extrinsinsicDocsArg
			)
		);
	};
}
