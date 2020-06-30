// import { ApiPromise } from '@polkadot/api';
// import { BlockHash } from '@polkadot/types/interfaces';
// import { isHex } from '@polkadot/util';
// import { NextFunction, Response } from 'express';
// import { BadRequest } from 'http-errors';
// import { parseBlockNumber } from 'src/utils';

// // Concretely Define locals on response to include BlockHash
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// type SASResponse = Omit<Response, 'locals'> & {
// 	locals: {
// 		blockHahs: BlockHash;
// 	};
// };

// export type Middleware = (
// 	req: Response,
// 	_res: Response,
// 	next: NextFunction
// ) => Promise<void>;

// export function createGetBlockHashMiddleware(api: ApiPromise): Middleware {
// 	const getHashForBlock = createGetHashForBlock(api);
// 	return async function (
// 		req: Response,
// 		_res: Response,
// 		next: NextFunction
// 	): Promise<void> {
// 		if (!('number' in req.params)) {
// 			return next();
// 		}

// 		try {
// 			req.locals.blockHash = (
// 				await getHashForBlock(req.params.number)
// 			).toString();
// 		} catch (err) {
// 			next(err);
// 		}
// 	};
// }

// const createGetHashForBlock = (api: ApiPromise) => async (
// 	blockId: string
// ): Promise<BlockHash> => {
// 	let blockNumber;

// 	try {
// 		const isHexStr = isHex(blockId);
// 		if (isHexStr && blockId.length === 66) {
// 			// This is a block hash
// 			return api.createType('BlockHash', blockId);
// 		} else if (isHexStr) {
// 			throw new BadRequest(
// 				`Cannot get block hash for ${blockId}. ` +
// 					`Hex string block IDs must be 32-bytes (66-characters) in length.`
// 			);
// 		}

// 		// Not a block hash, must be a block height
// 		try {
// 			blockNumber = parseBlockNumber(blockId);
// 		} catch {
// 			throw new BadRequest(
// 				`Cannot get block hash for ${blockId}. ` +
// 					`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`
// 			);
// 		}

// 		return await api.rpc.chain.getBlockHash(blockNumber);
// 	} catch (err) {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
// 		if (err && typeof err?.error === 'string') {
// 			throw err;
// 		}

// 		// Check if the block number is too high
// 		const { number } = await api.rpc.chain.getHeader();
// 		if (blockNumber && number.toNumber() < blockNumber) {
// 			throw new BadRequest(
// 				`Specified block number is larger than the current largest block. ` +
// 					`The largest known block number is ${number.toString()}.`
// 			);
// 		}

// 		throw { error: `Cannot get block hash for ${blockId}.` };
// 	}
// };
