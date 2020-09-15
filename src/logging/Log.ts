import { createLogger, Logger } from 'winston';

import { consoleTransport, fileTransport } from './transports';

const transports = [fileTransport, consoleTransport];

/**
 * Access a singleton Winston.Logger that will be intialized on first use.
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
	 * Sidecar's Winston.Logger.
	 */
	static get logger(): Logger {
		return this._logger || this.create();
	}
}
