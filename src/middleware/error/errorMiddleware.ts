import { ErrorRequestHandler } from 'express';

import { Log } from '../../logging/Log';

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

	const info = {
		code: 500,
		message: err.message ?? 'Internal Error',
		stack: err.stack,
	};

	Log.logger.error(info);

	res.status(500).send(info);
};
