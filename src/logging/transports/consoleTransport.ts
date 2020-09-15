import { TransformableInfo } from 'logform';
import { format, transports } from 'winston';

import { Config } from '../../Config';
import { filterApiRpc, nodeUtilFormat, stripTimestamp } from '../transformers';

const { config } = Config;

/**
 * Console transport for winston logger.
 */
export function consoleTransport() {
	/**
	 * A simple printing format for how `TransformableInfo` shows up.
	 */
	const simplePrint = format.printf((info: TransformableInfo) =>
		info?.stack // If there is a stack dump (e.g. error middleware), show that in console
			? `${info?.timestamp as string} ${info?.level}: ${
					info?.message
			  } \n ${info?.stack as string}`
			: `${info?.timestamp as string} ${info?.level}: ${info?.message}`
	);

	return new transports.Console({
		level: config.CONSOLE_LEVEL || 'info',
		handleExceptions: true,
		format: format.combine(
			filterApiRpc(),
			stripTimestamp(),
			nodeUtilFormat(),
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			format.colorize(),
			simplePrint
		),
		// Silence using `jest --silent`
		silent: process.argv.indexOf('--silent') >= 0,
	});
}
