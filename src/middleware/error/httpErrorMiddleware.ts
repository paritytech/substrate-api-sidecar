import { ErrorRequestHandler } from 'express';
import { HttpError } from 'http-errors';

import { Log } from '../../logging/Log';
/**
 * Handle HttpError instances.
 *
 * Should be put before middleware that handles Error, since HttpError
 * inherits from Error.
 *
 * @param exception unknown
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const httpErrorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !(err instanceof HttpError)) {
		return next(err);
	}

	const code = err.status;

	const info = {
		code,
		message: err.message,
		stack: err.stack,
	};

	Log.logger.error(info);

	res.status(code).send(info);
};
