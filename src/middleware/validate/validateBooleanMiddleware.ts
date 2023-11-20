// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

/**
 * Validate that the given query params that are expected to be booleans are correct.
 *
 * @param queryParams An array of queryParams to check for. These are passed in at the controller level.
 */
export const validateBooleanMiddleware = (queryParams: string[]): RequestHandler => {
	return (req, _res, next) => {
		const errQueryParams: string[] = [];

		for (const key of queryParams) {
			if (req.query[key]) {
				const queryParamVal = typeof req.query[key] === 'string' ? (req.query[key] as string).toLowerCase() : '';
				if (!(queryParamVal === 'true' || queryParamVal === 'false')) {
					errQueryParams.push(`Query parameter: ${key} has an invalid boolean value of ${req.query[key] as string}`);
				}
			}
		}

		if (errQueryParams.length > 0) {
			return next(new BadRequest(errQueryParams.join(' - ')));
		}

		return next();
	};
};
