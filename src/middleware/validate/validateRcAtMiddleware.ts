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
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { verifyUInt } from '../../util/integers/verifyInt';

/**
 * Express Middleware to validate the `rcAt` query parameter.
 *
 * This middleware performs the following validations:
 * 1. Block format validation - ensures rcAt is a valid block number or hash
 * 2. Mutual exclusivity - checks that both `at` and `rcAt` aren't provided
 * 3. Asset Hub requirement - validates that the current API is connected to Asset Hub
 * 4. Relay chain availability - ensures relay chain API is available
 */
export const validateRcAtMiddleware: RequestHandler = (req, _res, next) => {
	const { at, rcAt } = req.query;

	// If rcAt is not provided, continue without validation
	if (!rcAt) {
		return next();
	}

	// 1. Mutual exclusivity check
	if (at && rcAt) {
		return next(new BadRequest('Cannot specify both "at" and "rcAt" parameters'));
	}

	// 2. Block format validation
	if (typeof rcAt !== 'string') {
		return next(new BadRequest('rcAt must be a string'));
	}

	const [isValidBlock, blockError] = validateBlockIdentifier(rcAt);
	if (!isValidBlock) {
		return next(new BadRequest(`Invalid rcAt parameter: ${blockError}`));
	}

	// 3. Asset Hub requirement check
	const assetHubInfo = ApiPromiseRegistry.assetHubInfo;
	if (!assetHubInfo.isAssetHub) {
		return next(new BadRequest('rcAt parameter is only supported for Asset Hub endpoints'));
	}

	// 4. Relay chain availability check
	const relayChainApis = ApiPromiseRegistry.getApiByType('relay');
	if (!relayChainApis || relayChainApis.length === 0) {
		return next(
			new BadRequest(
				'rcAt parameter requires relay chain API to be available. Please configure SAS_SUBSTRATE_MULTI_CHAIN_URL',
			),
		);
	}

	return next();
};

/**
 * Validate that a block identifier is properly formatted.
 * Similar to the validation in AbstractController.getHashForBlock but for middleware use.
 *
 * @param blockId Block identifier (number or hash)
 * @returns [isValid, errorMessage]
 */
function validateBlockIdentifier(blockId: string): [boolean, string | undefined] {
	// Check if it's a hex string
	if (isHex(blockId)) {
		if (blockId.length === 66) {
			// Valid 32-byte block hash
			return [true, undefined];
		} else {
			return [false, 'Hex string block IDs must be 32-bytes (66-characters) in length'];
		}
	}

	// Check if it starts with 0x but isn't valid hex
	if (blockId.slice(0, 2) === '0x') {
		return [false, 'Hex string block IDs must be a valid hex string and must be 32-bytes (66-characters) in length'];
	}

	// Must be a block number - validate it's a non-negative integer
	const blockNumber = Number(blockId);
	if (!verifyUInt(blockNumber)) {
		return [false, 'Block IDs must be either 32-byte hex strings or non-negative decimal integers'];
	}

	return [true, undefined];
}
