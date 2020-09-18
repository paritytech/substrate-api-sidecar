import { format, transports } from 'winston';

import { Config } from '../../Config';
import {
	nodeUtilFormat,
	stripAnsi,
	stripTimestamp,
	timeStamp,
} from '../transformers';

const {
	config: { LOG },
} = Config;

/**
 * File transport for winston.Logger.
 */
export function fileTransport(): transports.FileTransportInstance {
	const transformers = [
		stripTimestamp(),
		nodeUtilFormat(),
		timeStamp,
		format.prettyPrint(),
	];

	if (LOG.STRIP_ANSI) {
		// IMPORTANT: We need to add this at the front so it is before `prettyPrint`
		transformers.unshift(stripAnsi());
	}

	return new transports.File({
		level: LOG.FILE_LEVEL || 'http',
		filename: LOG.FILE_PATH || `./logs/file-transport.log`,
		maxsize: LOG.FILE_SIZE || 524_288_000, // 500MB
		maxFiles: LOG.FILE_COUNT || 2, // Max 1gb
		format: format.combine(...transformers),
		// Silence using `jest --silent`
		silent: process.argv.indexOf('--silent') >= 0,
	});
}
