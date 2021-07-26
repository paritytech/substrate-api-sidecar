import { createLogger, Logger } from 'winston';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';

import { consoleTransport } from './transports';

/**
 * Access a singleton winston.Logger that will be intialized on first use.
 */
export class Log {
	private static _transports: ConsoleTransportInstance[] | undefined;
	private static _logger: Logger | undefined;
	private static create(): Logger {
		if (this._logger) {
			return this._logger;
		}

		// Note: there is a `fileTransport` that gets added in main.
		this._transports = [consoleTransport()];

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
