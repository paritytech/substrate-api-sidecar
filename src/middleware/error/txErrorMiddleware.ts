import { ErrorRequestHandler } from 'express';

import { isTxLegacyError } from '../../types/errors';

/**
 * Handle errors from tx POST methods
 *
 * @param exception unknown
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const txErrorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !isTxLegacyError(err)) {
		return next(err);
	}

	const { error, data, cause, stack } = err;

	res.status(500).send({
		code: 500,
		error,
		data,
		cause,
		stack,
	});
};
