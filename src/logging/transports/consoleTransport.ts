import { TransformableInfo } from 'logform';
import { format, transports } from 'winston';

import { SidecarConfig } from '../../SidecarConfig';
import {
	filterApiRpc,
	nodeUtilFormat,
	stripAnsi,
	stripTimestamp,
	timeStamp,
} from '../transformers';

/**
 * Console transport for winston logger.
 */
export function consoleTransport(): transports.ConsoleTransportInstance {
	const {
		config: { LOG },
	} = SidecarConfig;
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

	const transformers = [stripTimestamp(), nodeUtilFormat(), timeStamp];

	if (!LOG.JSON) {
		transformers.push(format.colorize(), simplePrint);
	} else {
		transformers.push(format.prettyPrint());
	}

	if (LOG.STRIP_ANSI) {
		transformers.unshift(stripAnsi());
	}

	if (LOG.FILTER_RPC) {
		transformers.unshift(filterApiRpc());
	}

	return new transports.Console({
		level: LOG.LEVEL || 'info',
		handleExceptions: true,
		format: format.combine(...transformers),
		// Silence using `jest --silent`
		silent: process.argv.indexOf('--silent') >= 0,
	});
}
