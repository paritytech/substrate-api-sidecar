import { transports } from 'winston';

import { SidecarConfig } from '../../SidecarConfig';

export const fileTransport = (
	level: string,
	fileName: string
): transports.FileTransportInstance => {
	return new transports.File({
		level,
		filename: `${SidecarConfig.config.LOG.WRITE_PATH}/${fileName}`,
		handleExceptions: true,
		maxsize: SidecarConfig.config.LOG.WRITE_MAX_FILE_SIZE,
		maxFiles: SidecarConfig.config.LOG.WRITE_MAX_FILES,
	});
};
