import { ErrorRequestHandler } from 'express';

import { Log } from '../../logging/Log';
import { isTxLegacyError } from '../../types/errors';

/**
 * Handle errors from transaction POST methods
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

	const { error, data, cause, stack, transaction } = err;

	const info = {
		code: 500,
		error,
		data,
		transaction,
		cause,
		stack,
	};

	Log.logger.error({
		...info,
		message: `${error}\n Cause: ${cause as string}\n Transaction: ${
			transaction as string
		}`,
	});

	res.status(500).send(info);
};
