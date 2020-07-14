import { ErrorRequestHandler } from 'express';
import { HttpError, InternalServerError } from 'http-errors';
import * as HttpErrorConstructor from 'http-errors';

import {
	isBasicLegacyError,
	isLegacyError,
	isTxLegacyError,
} from '../types/errors';

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

	const { error, data, cause } = err;

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
