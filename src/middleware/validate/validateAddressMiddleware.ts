// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { isHex } from '@polkadot/util';
import { base58Decode, checkAddressChecksum, isEthereumAddress } from '@polkadot/util-crypto';
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
 * Express Middleware to validate that an `:address` given as a query parameter is properly formatted.
 * It also does the following checks:
 * 	- that the query parameter name is `addresses`.
 * 	- that the query parameter is given as an array of addresses or a string of comma separated addresses.
 * 	- validates all addresses found in the query parameter.
 */
export const validateAddressQueryParamMiddleware: RequestHandler = (req, _res, next) => {
	// Check that the query parameter name is `addresses`.
	const queryParamKey = Object.keys(req.query);
	const validParamKey = queryParamKey.filter((key) => /^addresses$/.test(key));

	if (validParamKey.length != queryParamKey.length || validParamKey.length === 0) {
		return next(new BadRequest(`Please use the query parameter key 'addresses' to provide the addresses values.`));
	}

	// Check that the addresses are valid. Same check as in the `validateAddressMiddleware` but for query parameters.
	for (const param of validParamKey) {
		const addresses = req.query[param];
		// Check if the address is a string of comma separated addresses or an array of addresses.
		if (typeof addresses === 'string') {
			const addressesArray = addresses.split(',');

			if (addressesArray.length <= 1) {
				return next(new BadRequest(`At least two addresses are required for comparison.`));
			}

			for (const address of addressesArray) {
				const [isValid, error] = checkAddress(address);
				if (!isValid && error) {
					return next(new BadRequest(`Invalid ${param}: ${error}`));
				}
			}
		} else if (Array.isArray(addresses)) {
			if (addresses.length <= 1) {
				return next(new BadRequest(`At least two addresses are required for comparison.`));
			}

			for (const address of addresses) {
				const [isValid, error] = checkAddress(address as string);
				if (!isValid && error) {
					return next(new BadRequest(`Invalid ${param}: ${error}`));
				}
			}
		}
	}

	return next();
};

/**
 * Verify that an address is a valid substrate address.
 *
 * Note: this is very similar '@polkadot/util-crypto/address/checkAddress,
 * except it does not check the ss58 prefix and supports H256/H160 raw address.
 *
 * @param address potential ss58 or raw address
 */
function checkAddress(address: string): [boolean, string | undefined] {
	let u8Address;

	if (isHex(address)) {
		u8Address = Uint8Array.from(Buffer.from(address.slice(2), 'hex'));
	} else {
		try {
			u8Address = base58Decode(address);
		} catch (error) {
			return [false, (error as Error).message];
		}
	}

	if (defaults.allowedEncodedLengths.includes(u8Address.length)) {
		const [isValid] = checkAddressChecksum(u8Address);

		return [isValid, isValid ? undefined : 'Invalid decoded address checksum'];
	}

	if (isEthereumAddress(address)) {
		return [true, undefined];
	}

	return [false, 'Invalid address format'];
}
