import { ErrorRequestHandler } from 'express';
import * as HttpErrorConstructor from 'http-errors';
import { InternalServerError } from 'http-errors';

import { Log } from '../../logging/Log';
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
		const info = {
			code: err.statusCode,
			message: HttpErrorConstructor(err.statusCode, err.error),
		};

		Log.logger.error(info);

		res.status(err.statusCode).send(info.message);
		return;
	}

	res.status(500).send(new InternalServerError(err.error));
};
