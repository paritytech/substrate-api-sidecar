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

import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { ApiPromiseRegistry } from '../../apiRegistry';

/**
 * Express Middleware to validate the `useRcBlock` query parameter.
 *
 * This middleware performs the following validations:
 * 1. Asset Hub requirement - validates that the current API is connected to Asset Hub
 * 2. Relay chain availability - ensures relay chain API is available
 * 3. Boolean validation - ensures useRcBlock is a valid boolean string
 */
export const validateUseRcBlockMiddleware: RequestHandler = (req, _res, next) => {
	const { useRcBlock } = req.query;

	// If useRcBlock is not provided, continue without validation
	if (!useRcBlock) {
		return next();
	}

	// 1. Boolean validation
	if (typeof useRcBlock !== 'string') {
		return next(new BadRequest('useRcBlock must be a string'));
	}

	if (useRcBlock !== 'true' && useRcBlock !== 'false') {
		return next(new BadRequest('useRcBlock must be either "true" or "false"'));
	}

	// Only validate Asset Hub and relay chain requirements if useRcBlock is true
	if (useRcBlock === 'true') {
		// 2. Asset Hub requirement check
		const assetHubInfo = ApiPromiseRegistry.assetHubInfo;
		if (!assetHubInfo.isAssetHub) {
			return next(new BadRequest('useRcBlock parameter is only supported for Asset Hub endpoints'));
		}

		// 3. Relay chain availability check
		const relayChainApis = ApiPromiseRegistry.getApiByType('relay');
		if (!relayChainApis || relayChainApis.length === 0) {
			return next(
				new BadRequest(
					'useRcBlock parameter requires relay chain API to be available. Please configure SAS_SUBSTRATE_MULTI_CHAIN_URL',
				),
			);
		}
	}

	return next();
};
