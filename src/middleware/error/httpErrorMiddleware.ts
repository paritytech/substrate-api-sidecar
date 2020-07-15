import { ErrorRequestHandler } from 'express';
import { HttpError } from 'http-errors';

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
	res.status(code).send({
		code,
		message: err.message,
		stack: err.stack,
	});
};
