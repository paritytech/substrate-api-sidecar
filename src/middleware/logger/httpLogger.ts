import e from 'express';
import * as expressWinston from 'express-winston';
import winston from 'winston';

export const httpLoggerCreate = (winstonInstance: winston.Logger): e.Handler =>
	expressWinston.logger({
		// transports,
		winstonInstance,
		msg: `{{req.method}} {{req.url}} {{req.res.statusCode}} {{res.responseTime}}ms`,
		level: (_req, res) => {
			const { statusCode } = res;
			if (statusCode < 400) {
				// `http` is above `info`, so one needs to opt into `http` or above log level to view sub 400
				return 'http';
			}
			if (statusCode < 500) {
				return 'warn';
			}

			return 'error';
		},
	});
