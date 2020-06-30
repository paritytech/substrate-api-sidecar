import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { isHex } from '@polkadot/util';
import { Router } from 'express';
import * as express from 'express';
import { parseBlockNumber } from 'src/utils';

export default abstract class BaseController {
	private readonly _path: string;
	private _router: Router = express.Router();
	protected api: ApiPromise;

	abstract initRoutes(): void;

	get path(): string {
		return this._path;
	}

	get router(): Router {
		return this._router;
	}

	async getHashForBlock(blockId: string): Promise<BlockHash> {
		try {
			let blockNumber;

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
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (err && typeof err.error === 'string') {
				throw err;
			}

			throw { error: `Cannot get block hash for ${blockId}.` };
		}
	}
}
