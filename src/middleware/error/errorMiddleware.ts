import { ErrorRequestHandler } from 'express';

/**
 * Handle Error instances.
 *
 * @param err unknown
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const errorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !(err instanceof Error)) {
		return next(err);
	}

	res.status(500).send({
		code: 500,
		message: err.message ?? 'Internal Error',
		stack: err.stack,
	});
};
