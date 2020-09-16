import { TransformableInfo } from 'logform';
import { format, transports } from 'winston';

import { Config } from '../../Config';
import {
	filterApiRpc,
	nodeUtilFormat,
	stripTimestamp,
	timeStamp,
} from '../transformers';

const { config } = Config;

/**
 * Console transport for winston logger.
 */
export function consoleTransport(): transports.ConsoleTransportInstance {
	/**
	 * A simple printing format for how `TransformableInfo` shows up.
	 */
	const simplePrint = format.printf((info: TransformableInfo) => {
		if (info?.stack) {
			// If there is a stack dump (e.g. error middleware), show that in console
			return `${info?.timestamp as string} ${info?.level}: ${
				info?.message
			} \n ${info?.stack as string}`;
		}

		return `${info?.timestamp as string} ${info?.level}: ${info?.message}`;
	});

	return new transports.Console({
		level: config.CONSOLE_LEVEL || 'info',
		handleExceptions: true,
		format: format.combine(
			filterApiRpc(),
			stripTimestamp(),
			nodeUtilFormat(),
			timeStamp,
			format.colorize(),
			simplePrint
		),
		// Silence using `jest --silent`
		silent: process.argv.indexOf('--silent') >= 0,
	});
}
