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
		let sanitizedBody;
		try {
			sanitizedBody = sanitizeNumbers(body) as T;
			console.log(sanitizedBody);
		} catch (e) {
			if (e) {
				return next(new InternalServerError(String(e)));
			}
			return next(
				new InternalServerError(
					'Failure while trying to sanitize the response body.'
				)
			);
		}

		try {
			return _send.call(res, sanitizedBody) as Response<T>;
		} catch (e) {
			if (e) {
				return next(new InternalServerError(String(e)));
			}
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
