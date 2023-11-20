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

import { Log } from '../../logging/Log';

/**
 * Handle Error instances.
 *
 * @param err unknown
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const errorMiddleware: ErrorRequestHandler = (err: unknown, _req, res, next): void => {
	if (res.headersSent || !(err instanceof Error)) {
		return next(err);
	}

	const info = {
		code: 500,
		message: err.message ?? 'Internal Error',
		stack: err.stack,
	};

	Log.logger.error(info);

	res.status(500).send(info);
};
