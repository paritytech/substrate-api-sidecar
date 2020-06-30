import { ApiPromise } from '@polkadot/api';
import { isHex } from '@polkadot/util';
import checkChecksum from '@polkadot/util-crypto/address/checkChecksum';
import defaults from '@polkadot/util-crypto/address/defaults';
import base58Decode from '@polkadot/util-crypto/base58/decode';
import { NextFunction, Request, Response } from 'express';

import HttpException from '../exceptions/HttpException';
import { parseBlockNumber } from '../utils';

type Middleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

/**
 * Express middleware to validate that an `:address` param is properly formatted.
 */
export function validateAddressMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction
): void {
	if (!('address' in req.params)) {
		return next();
	}

	const [isValid, error] = checkAddress(req.params.address);

	if (!isValid && error) {
		return next(new HttpException(400, error));
	}

	next();
}

/**
 * Express middleware to verify that an address is a valid substrate ss58 address.
 *
 * Note: this is very similar '@polkadot/util-crypto/address/checkAddress,
 * except it does not check the prefix.
 *
 * @param address potential ss58 address
 */
function checkAddress(address: string): [boolean, string | null] {
	let decoded;

	try {
		decoded = base58Decode(address);
	} catch (error) {
		return [false, (error as Error).message];
	}

	if (!defaults.allowedEncodedLengths.includes(decoded.length)) {
		return [false, 'Invalid decoded address length'];
	}

	const [isValid] = checkChecksum(decoded);

	return [isValid, isValid ? null : 'Invalid decoded address checksum'];
}

export const createValidateHeightMiddleware = (api: ApiPromise): Middleware => {
	const validateHeight = cachedMaxBlockHeight(api);

	return async function validateHeightMiddleware(
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<void> {
		console.log(isHex(req.params.number));
		if (!('number' in req.params) || isHex(req.params.number)) {
			return next();
		}

		const reqBlockHeight = parseBlockNumber(req.params.number);

		const [isValid, error] = await validateHeight(reqBlockHeight);

		if (!isValid) {
			return next(new HttpException(400, error as string));
		}

		next();
	};
};

/**
 * Verify that a given block height is not over higher than the tip.
 *
 * This is a currying functions that keeps around an ApiPromise and max
 * seen block height so it can be used in middleware and avoid unnecessary
 * calls to the node.
 */
export const cachedMaxBlockHeight = (
	api: ApiPromise
): ((height: number) => Promise<[boolean, string | null]>) => {
	let maxSeenHeight = 0;
	return async (height: number): Promise<[boolean, string | null]> => {
		if (height < maxSeenHeight) {
			return [true, null];
		}

		const { number } = await api.rpc.chain.getHeader();

		maxSeenHeight = number.toNumber();

		if (height > maxSeenHeight) {
			return [
				false,
				`Given block height is higher than the current chain tip. ` +
					`Known tip is at height ${maxSeenHeight}.`,
			];
		}

		return [true, null];
	};
};
