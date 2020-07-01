import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { Request, Response } from 'express';

import ApiHandler from '../ApiHandler';
import AbstractController from './AbstractController';

/**
 * GET a block.
 *
 * Paths:
 * - (Optional) `number`: Block hash or height at which to query. If not provided, queries
 *   finalized head.
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
 *   - `method`: Extrinsic method, `{module}.{function}`.
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
export default class BlocksController extends AbstractController {
	handler: ApiHandler;
	constructor(api: ApiPromise) {
		super(api, '/block');
		this.handler = new ApiHandler(api);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router
			.get(this.path, this.getLatestBlock)
			.get(`${this.path}/:number`, this.getBlockById);
	}

	/**
	 * Get the latest block.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getLatestBlock = async (
		_req: Request,
		res: Response
	): Promise<void> => {
		const hash = await this.api.rpc.chain.getFinalizedHead();
		res.send(await this.handler.fetchBlock(hash));
	};

	/**
	 * Get a block by a hash or number identifier.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getBlockById = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const hash: BlockHash = await this.getHashForBlock(req.params.number);
		res.send(await this.handler.fetchBlock(hash));
	};
}
