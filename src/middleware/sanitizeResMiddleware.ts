import { NextFunction, Request, Response } from 'express';
import { Send } from 'express-serve-static-core';
import { InternalServerError } from 'http-errors';

import sanitizeNumbers from './sanitizeNumbers';

export default function sanitizeResMiddleware<T>(
	_req: Request,
	res: Response<T>,
	next: NextFunction
): void {
	const _send = res.send;

	function newSend<T>(body: T): Response<T> | void {
		try {
			const sanitizedBody = sanitizeNumbers(body) as T;

			return _send.call(res, sanitizedBody) as Response<T>;
		} catch {
			return next(
				new InternalServerError(
					'Unknown failure while trying to sanitize and `send` the response body.'
				)
			);
		}
	}

	res.send = newSend as Send<T, Response<T>>;

	return next();
}
