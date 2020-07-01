import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { isHex } from '@polkadot/util';
import { Router } from 'express';
import * as express from 'express';
import { BadRequest } from 'http-errors';

import { parseBlockNumber } from '../utils';

/**
 * Abstract base class for creating controller classes.
 */
export default abstract class AbstractController {
	private _path: string;
	private _router: Router = express.Router();
	protected api: ApiPromise;
	constructor(api: ApiPromise, path: string) {
		this.api = api;
		this._path = path;
	}

	get path(): string {
		return this._path;
	}

	get router(): Router {
		return this._router;
	}

	/**
	 * Mount all controller handler methods on the classes private router.
	 */
	protected abstract initRoutes(): void;

	/**
	 * Create or retrieve the corresponding BlockHash for the given block identifier.
	 * This also acts as a validation for string based block identifiers.
	 *
	 * @param blockId string representing a hash or number block identifier.
	 */
	async getHashForBlock(blockId: string): Promise<BlockHash> {
		let blockNumber;

		try {
			const isHexStr = isHex(blockId);
			if (isHexStr && blockId.length === 66) {
				// This is a block hash
				return this.api.createType('BlockHash', blockId);
			} else if (isHexStr) {
				throw {
					error:
						`Cannot get block hash for ${blockId}. ` +
						`Hex string block IDs must be 32-bytes (66-characters) in length.`,
				};
			}

			// Not a block hash, must be a block height
			try {
				blockNumber = parseBlockNumber(blockId);
			} catch (err) {
				throw {
					error:
						`Cannot get block hash for ${blockId}. ` +
						`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`,
				};
			}

			return await this.api.rpc.chain.getBlockHash(blockNumber);
		} catch (err) {
			// Check if the block number is too high
			const { number } = await this.api.rpc.chain.getHeader();
			if (blockNumber && number.toNumber() < blockNumber) {
				throw new BadRequest(
					`Specified block number is larger than the current largest block. ` +
						`The largest known block number is ${number.toString()}.`
				);
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (err && typeof err.error === 'string') {
				throw err;
			}

			throw { error: `Cannot get block hash for ${blockId}.` };
		}
	}
}
