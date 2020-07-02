import { NextFunction, Request, Response } from 'express';
import { Send } from 'express-serve-static-core';
import { InternalServerError } from 'http-errors';

import sanitizeNumbers from './sanitizeNumbers';

/**
 * Reassigns the original `res.send` to a new function that calls `sanitizeNumbers`
 * on the response body, and then calls the original `res.send`.
 *
 * @param _req
 * @param res
 * @param next
 */
export default function sanitizeResMiddleware<T>(
	_req: Request,
	res: Response<T>,
	next: NextFunction
): void {
	const _send = res.send;

	function newSend<T>(body: T): Response<T> | void {
		let sanitizedBody;
		try {
			sanitizedBody = sanitizeNumbers(body) as T;
		} catch (e) {
			return next(
				new InternalServerError(
					'Failure while trying to sanitized the response body.'
				)
			);
		}

		try {
			// Call the original send method, with the response bound to it
			return _send.call(res, sanitizedBody) as Response<T>;
		} catch (e) {
			return next(
				new InternalServerError(
					'Failure while trying to send the response body'
				)
			);
		}
	}

	res.send = newSend as Send<T, Response<T>>;

	return next();
}
