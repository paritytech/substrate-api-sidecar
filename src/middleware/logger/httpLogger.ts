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

import e from 'express';
import * as expressWinston from 'express-winston';
import winston from 'winston';

export const httpLoggerCreate = (winstonInstance: winston.Logger): e.Handler =>
	expressWinston.logger({
		// transports,
		winstonInstance,
		msg: `{{req.method}} {{req.url}} {{req.res.statusCode}} {{res.responseTime}}ms`,
		level: (_req, res) => {
			const { statusCode } = res;
			if (statusCode < 400) {
				// `http` is above `info`, so one needs to opt into `http` or above log level to view sub 400
				return 'http';
			}
			if (statusCode < 500) {
				return 'warn';
			}

			return 'error';
		},
	});
