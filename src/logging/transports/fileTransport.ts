import { transports } from 'winston';

export const fileTransport = (
	level: string,
	fileName: string
): transports.FileTransportInstance => {
	return new transports.File({
		level,
		filename: `${__dirname}/logs/${fileName}`,
		handleExceptions: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
	});
}
