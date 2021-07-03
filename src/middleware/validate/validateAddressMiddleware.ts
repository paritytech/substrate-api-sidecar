import { checkAddressChecksum } from '@polkadot/util-crypto';
import { base58Decode } from '@polkadot/util-crypto';
import { defaults } from '@polkadot/util-crypto/address/defaults';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

/**
 * Express Middleware to validate that an `:address` param is properly formatted.
 */
export const validateAddressMiddleware: RequestHandler = (req, _res, next) => {
	if (!('address' in req.params)) {
		return next();
	}

	const [isValid, error] = checkAddress(req.params.address);

	if (!isValid && error) {
		return next(new BadRequest(error));
	}

	return next();
};

/**
 * Verify that an address is a valid substrate address.
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
		// 
		if (address.startsWith('0x')) {
			decoded = Uint8Array.from(Buffer.from(address.slice(2), 'hex'));
	
			if (decoded.length != 20) {
				return [false, `Invalid decoded address length ${decoded.length} for H160 account`];
			}
	
			return [true, undefined];
		}
		return [false, (error as Error).message];
	}

	if (!defaults.allowedEncodedLengths.includes(decoded.length)) {
		return [false, `Invalid encoded address length`];
	}

	const [isValid] = checkAddressChecksum(decoded);
	
	return [isValid, isValid ? undefined : 'Invalid decoded address checksum'];
}