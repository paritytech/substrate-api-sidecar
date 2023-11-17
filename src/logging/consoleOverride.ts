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

/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */

import { format } from 'util';
import { LeveledLogMethod, Logger } from 'winston';

/**
 * Override console methods with a winston.Logger.
 *
 * @param logger
 */
export function consoleOverride(logger: Logger): void {
	[
		['log', 'info'],
		['info', 'info'],
		['warn', 'warn'],
		['error', 'error'],
		['debug', 'debug'],
	].forEach(([consoleLevel, winstonLevel]) => {
		console[consoleLevel] = function (...args: unknown[]) {
			// We typecast here because the typescript compiler is not sure what we are keying into.
			// The type within the logger of any of the following log levels is `LeveledLogMethod`.
			(logger[winstonLevel] as LeveledLogMethod).call<Logger, string[], Logger>(logger, format.apply(format, args));
		};
	});
}
