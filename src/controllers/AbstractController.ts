import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { AnyJson, Codec } from '@polkadot/types/types';
import { isHex } from '@polkadot/util';
import { RequestHandler, Response, Router } from 'express';
import * as express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { BadRequest } from 'http-errors';
import {
	AddressNumberParams,
	AddressParam,
	NumberParam,
} from 'src/types/request_types';

import sanitizeNumbers from './utils/sanitizeNumbers';

type SidecarRequestHandler =
	| RequestHandler<AddressParam>
	| RequestHandler<AddressNumberParams>
	| RequestHandler<NumberParam>
	| RequestHandler;


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
	 *
	 * Keep in mind that asynchronous errors in the RequestHandlers need to be
	 * dealt with manually. You can wrap the handler with `catchWrap`
	 * (a method in this class) or handle the errors within the RequestHandler.
	 */
	protected abstract initRoutes(): void;

	/**
	 * Safely mount async GET routes by wrapping them with an express
	 * handler friendly try / catch block and then mounting on the controllers
	 * router.
	 *
	 * @param pathsAndHandlers tuple array of the suffix to the controller base
	 * path (use empty string if no suffix) and the get request handler function.
	 */
	protected safeMountAsyncGetHandlers(
		pathsAndHandlers: [string, SidecarRequestHandler][]
	): void {
		for (const pathAndHandler of pathsAndHandlers) {
			const [pathSuffix, handler] = pathAndHandler;
			this.router.get<ParamsDictionary | AddressParam>(
				`${this.path}${pathSuffix}`,
				this.catchWrap(handler as RequestHandler)
			);
		}
	}

	/**
	 * Wrapper for any asynchronous RequestHandler function. Pipes errors
	 * to downstream error handling middleware.
	 *
	 * @param cb ExpressHandler
	 */
	protected catchWrap = (cb: RequestHandler): RequestHandler => async (
		req,
		res,
		next
	): Promise<void> => {
		try {
			await cb(req, res, next);
		} catch (err) {
			next(err);
		}
	};

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
				blockNumber = this.parseBlockNumber(blockId);
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

			throw {
				error: `Cannot get block hash for ${blockId}.`,
			};
		}
	}

	private parseBlockNumber(n: string): number {
		const num = Number(n);

		if (!Number.isInteger(num) || num < 0) {
			throw { error: 'Invalid block number' };
		}

		return num;
	}

	static sanitizeAndSend(res: Response, body: AnyCodecAndJson): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const sanitizedBody = sanitizeNumbers(body) as AnyCodecAndJson;

		(res as Response<AnyCodecAndJson>).send(sanitizedBody);
	}
}
