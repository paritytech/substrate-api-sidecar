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

// Query Params used in controllers
const queryParams = [
	'eventDocs', // BlocksController
	'extrinsicDocs', // BlocksController
	'finalized', // BlocksController
	'denominated', // AccountsBalanceController
	'unclaimedOnly', // AccountsStakingPayoutsController
	'actions', // BlocksTraceController
	'includeFee', // NodeTransactionPoolController
	'adjustMetadataV13', // PalletsStorageController
	'currentLeaseHolders', // ParasController
	'noMeta', // TransactionMaterialController
];

export const validateBooleanMiddleware: RequestHandler = (req, _res, next) => {
	const queryKeys = Object.keys(req.query);
	const errQueryParams: string[] = [];
	queryKeys
		.filter((queryParam) => queryParams.includes(queryParam))
		.forEach((queryParam) => {
			const queryParamVal =
				typeof req.query[queryParam] === 'string'
					? (req.query[queryParam] as string).toLowerCase()
					: '';
			if (!(queryParamVal === 'true' || queryParamVal === 'false')) {
				errQueryParams.push(
					`Query parameter: ${queryParam} has an invalid boolean value of ${
						req.query[queryParam] as string
					}`
				);
			}
		});

	if (errQueryParams.length > 0) {
		return next(new BadRequest(errQueryParams.join(' - ')));
	}

	return next();
};
