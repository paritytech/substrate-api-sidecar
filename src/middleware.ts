import checkAddress from '@polkadot/util-crypto/address/check';
import * as e from 'express';

/**
 * Express Middleware to validate that address params are properly formatted.
 *
 * @param prefix chainSS58 prefix
 * Read more at: https://github.com/paritytech/substrate/wiki/External-Address-Format-(SS58)
 */
export const validateSS58Address = (prefix: number) => (
	req: e.Request,
	_res: e.Response,
	next: e.NextFunction
): void => {
	if (!req.params.address) {
		next();
	}

	const [isValid, error] = checkAddress(req.params.address, prefix);
	if (!isValid) {
		throw {
			statusCode: 400,
			error,
		};
	}

	next();
};
