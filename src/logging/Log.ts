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

import { createLogger, Logger } from 'winston';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports';

import { SidecarConfig } from '../SidecarConfig';
import { consoleTransport, fileTransport } from './transports';

/**
 * Access a singleton winston.Logger that will be intialized on first use.
 */
export class Log {
	private static _transports: (ConsoleTransportInstance | FileTransportInstance)[] | undefined;
	private static _logger: Logger | undefined;
	private static create(): Logger {
		if (this._logger) {
			return this._logger;
		}

		this._transports = [consoleTransport()];

		/**
		 * By default this will be false unless specified as an ENV var.
		 */
		if (SidecarConfig.config.LOG.WRITE) {
			this._transports.push(fileTransport('logs.log'));
		}

		this._logger = createLogger({
			transports: this._transports,
			exitOnError: false,
			exceptionHandlers: this._transports,
		});

		return this._logger;
	}

	/**
	 * Sidecar's winston.Logger.
	 */
	static get logger(): Logger {
		return this._logger || this.create();
	}
}
