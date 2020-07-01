import checkChecksum from '@polkadot/util-crypto/address/checkChecksum';
import defaults from '@polkadot/util-crypto/address/defaults';
import base58Decode from '@polkadot/util-crypto/base58/decode';
import { NextFunction, Request, Response } from 'express';
import { BadRequest } from 'http-errors';

/**
 * Express Middleware to validate that an `:address` param is properly formatted.
 */
export function validateAddressMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction
): void {
	console.log(req.params);
	if (!('address' in req.params)) {
		return next();
	}

	const [isValid, error] = checkAddress(req.params.address);

	if (!isValid) {
		console.log('HUOHUOFHO');
		return next(new BadRequest(error));
	}

	next();
}

/**
 * Verify that an address is a valid substrate ss58 address.
 *
 * Note: this is very similar '@polkadot/util-crypto/address/checkAddress,
 * except it does not check the prefix.
 *
 * @param address potential ss58 address
 */
function checkAddress(address: string): [boolean, string | undefined] {
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

	return [isValid, isValid ? undefined : 'Invalid decoded address checksum'];
}
