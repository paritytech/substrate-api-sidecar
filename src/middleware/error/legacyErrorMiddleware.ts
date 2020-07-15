import { ErrorRequestHandler } from 'express';
import * as HttpErrorConstructor from 'http-errors';
import { InternalServerError } from 'http-errors';

import { isBasicLegacyError, isLegacyError } from '../../types/errors';

/**
 * Handle errors of an older format and prior to the introduction of http-error.
 *
 * @param err any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const legacyErrorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !isBasicLegacyError(err)) {
		return next(err);
	}

	if (isLegacyError(err)) {
		res.status(err.statusCode).send(
			HttpErrorConstructor(err.statusCode, err.error)
		);
		return;
	}

	res.status(500).send(new InternalServerError(err.error));
};
