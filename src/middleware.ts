import checkChecksum from '@polkadot/util-crypto/address/checkChecksum';
import defaults from '@polkadot/util-crypto/address/defaults';
import base58Decode from '@polkadot/util-crypto/base58/decode';
import * as e from 'express';

/**
 * Express Middleware to validate that address params are properly formatted.
 *
 * @param prefix chainSS58 prefix
 * Read more at: https://github.com/paritytech/substrate/wiki/External-Address-Format-(SS58)
 */
export const validateSS58Address = (
	req: e.Request,
	_res: e.Response,
	next: e.NextFunction
): void => {
	if (!req.params.address) {
		next();
	}

	console.log(req.params.address){
		req.params.address
	}

	const [isValid, error] = checkAddress(req.params.address);
	console.log(isValid);
	console.log('HELLO');
	console.log(error);
	if (!isValid) {
		next({
			statusCode: 400,
			error,
		});
	}
	console.log();

	next();
};

/**
 * Verify that an address is a valid ss58 substrate compatible address.
 * Note this is very similar '@polkadot/util-crypto/address/checkAddress,
 * expect it does not check the prefix.
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
