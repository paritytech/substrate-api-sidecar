import { format, transports } from 'winston';

import { Config } from '../../Config';
import { nodeUtilFormat, stripAnsi, stripTimestamp } from '../transformers';

const { config } = Config;

/**
 * File transport for Winston.Logger.
 */
export const fileTransport = new transports.File({
	level: config.FILE_LEVEL || 'http',
	filename: config.FILE_PATH || `./logs/file-transport.log`,
	maxsize: config.FILE_SIZE || 524_288_000, // 500MB
	maxFiles: config.FILE_COUNT || 2, // Max 1gb
	format: format.combine(
		stripTimestamp(),
		stripAnsi(),
		nodeUtilFormat(),
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
		format.prettyPrint()
	),
	// Silence using `jest --silent`
	silent: process.argv.indexOf('--silent') >= 0,
});
