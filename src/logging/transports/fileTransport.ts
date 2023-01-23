import { transports } from 'winston';

export const fileTransport = (
	level: string,
	fileName: string
): transports.FileTransportInstance => {

  let logsDirectory = __dirname;
  if (process.env.SAS_PATH_TO_LOG_FILES) {
    logsDirectory = process.env.SAS_PATH_TO_LOG_FILES;
  }

	return new transports.File({
		level,
		filename: `${logsDirectory}/logs/${fileName}`,
		handleExceptions: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
	});
};
