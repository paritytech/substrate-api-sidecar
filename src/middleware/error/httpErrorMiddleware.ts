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

import { ErrorRequestHandler } from 'express';
import { HttpError } from 'http-errors';

import { Log } from '../../logging/Log';
import { parseArgs } from '../../parseArgs';
import { httpErrorCounter } from '../../util/metrics';
/**
 * Handle HttpError instances.
 *
 * Should be put before middleware that handles Error, since HttpError
 * inherits from Error.
 *
 * @param exception unknown
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const httpErrorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !(err instanceof HttpError)) {
		return next(err);
	}
	const args = parseArgs();
	const code = err.status;

	const info = {
		code,
		message: err.message,
		stack: err.stack,
	};
	if (args.prometheus) {
		httpErrorCounter.inc();
	}
	Log.logger.error(info);

	res.status(code).send(info);
};
