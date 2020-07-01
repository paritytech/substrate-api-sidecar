import { NextFunction, Request, Response } from 'express';
import { HttpError, InternalServerError } from 'http-errors';
import * as HttpErrorConstructor from 'http-errors';

import { BasicError, LegacyError } from '../types/error_types';

/**
 * Handle HttpError and Error instances.
 *
 * @param exception
 * @param _req
 * @param res
 * @param next
 */
export function errorMiddleware(
	exception: HttpError | Error,
	_req: Request,
	res: Response,
	next: NextFunction
): void {
	if (
		res.headersSent ||
		!(exception instanceof HttpError) ||
		!(exception instanceof Error)
	) {
		return next(exception);
	}

	const code = exception instanceof HttpError ? exception.status : 500;
	res.status(code).send({
		code,
		message: exception?.message ?? 'Internal Error',
		stack: exception.stack,
	});
}

/**
 * Handle error formats from pre Sidecar v1.
 *
 * @param exception
 * @param _req
 * @param res
 * @param next
 */
export function legacyErrorMiddleware(
	exception: BasicError | LegacyError,
	_req: Request,
	res: Response,
	next: NextFunction
): void {
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
}

/**
 * The last backstop for errors that do not conform to one of Sidecars error
 * format. Used to create a standardized 500 error instead of relying on express.
 *
 * @param exception
 * @param _req
 * @param res
 * @param next
 */
export function internalErrorMiddleware(
	exception: unknown,
	_req: Request,
	res: Response,
	next: NextFunction
): void {
	// If express has started writing the response, we must default to the
	// built in express error handler in order to close the connection.
	if (res.headersSent) {
		return next(exception);
	}
	res.status(500).send(new InternalServerError('Internal Error'));
}
