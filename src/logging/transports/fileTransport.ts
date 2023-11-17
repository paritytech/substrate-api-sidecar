import { transports } from 'winston';

import { SidecarConfig } from '../../SidecarConfig';

export const fileTransport = (fileName: string): transports.FileTransportInstance => {
	return new transports.File({
		level: SidecarConfig.config.LOG.LEVEL,
		filename: `${SidecarConfig.config.LOG.WRITE_PATH}/${fileName}`,
		handleExceptions: true,
		maxsize: SidecarConfig.config.LOG.WRITE_MAX_FILE_SIZE,
		maxFiles: SidecarConfig.config.LOG.WRITE_MAX_FILES,
	});
};
