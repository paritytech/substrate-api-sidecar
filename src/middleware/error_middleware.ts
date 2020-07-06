import { NextFunction, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { HttpError, InternalServerError } from 'http-errors';
import * as HttpErrorConstructor from 'http-errors';

import { IBasicError, ILegacyError, ITxError } from '../types/error_types';

/**
 * Handle HttpError instances.
 *
 * Should be put before middleware that handles Error, since HttpError
 * inherits from Error.
 *
 * @param exception any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export function httpErrorMiddleware(
	exception: HttpError,
	_req: Request,
	res: Response,
	next: NextFunction
): void {
	if (res.headersSent || !(exception instanceof HttpError)) {
		return next(exception);
	}

	const code = exception.status;
	res.status(code).send({
		code,
		message: exception.message,
		stack: exception.stack,
	});
}

/**
 * Handle Error instances.
 *
 * @param exception any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const errorMiddleware: ErrorRequestHandler = (
	exception: Error,
	_req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (res.headersSent || !(exception instanceof Error)) {
		return next(exception);
	}

	res.status(500).send({
		code: 500,
		message: exception.message ?? 'Internal Error',
		stack: exception.stack,
	});
};

// TODO update this to be a proper type guard
function isTxError(exception: ITxError) {
	return exception?.error && exception.cause;
}

/**
 * Handle errors from tx POST methods
 *
 * @param exception any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const txErrorMiddleware: ErrorRequestHandler = (
	exception: ITxError,
	_req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (res.headersSent || !isTxError(exception)) {
		return next(exception);
	}

	const { error, data, cause } = exception;

	res.status(500).send({
		code: 500,
		error,
		data,
		cause,
	});
};

/**
 * Handle errors of an older format and prior to the introduction of http-error.
 *
 * @param exception any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const legacyErrorMiddleware: ErrorRequestHandler = (
	exception: IBasicError | ILegacyError,
	_req,
	res,
	next
): void => {
	if (res.headersSent || !('error' in exception)) {
		return next(exception);
	}

	if ('statusCode' in exception) {
		res.status(exception.statusCode).send(
			HttpErrorConstructor(exception.statusCode, exception.error)
		);
		return;
	}

	res.status(500).send(new InternalServerError(exception.error));
};

/**
 * The last backstop for errors that do not conform to one of Sidecars error
 * format. Used to create a standardized 500 error instead of relying on express.
 *
 * @param exception any
 * @param _req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const internalErrorMiddleware: ErrorRequestHandler = (
	exception: unknown,
	_req,
	res,
	next
): void => {
	// If express has started writing the response, we must default to the
	// built in express error handler in order to close the connection.
	if (res.headersSent) {
		return next(exception);
	}
	res.status(500).send(new InternalServerError('Internal Error'));
};
