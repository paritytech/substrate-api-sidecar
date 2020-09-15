import { createLogger, Logger } from 'winston';

import { consoleTransport } from './transports';

// Note: there is a `fileTransport` that gets added in main.
const transports = [consoleTransport()];

/**
 * Access a singleton winston.Logger that will be intialized on first use.
 */
export class Log {
	private static _logger: Logger | undefined;
	private static create(): Logger {
		if (this._logger) {
			return this._logger;
		}

		this._logger = createLogger({
			transports,
			exitOnError: false,
			exceptionHandlers: transports,
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
