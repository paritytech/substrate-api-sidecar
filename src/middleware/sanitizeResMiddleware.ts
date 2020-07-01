import { NextFunction, Request, Response } from 'express';
import { Send } from 'express-serve-static-core';
import { InternalServerError } from 'http-errors';

import sanitizeNumbers from './sanitizeNumbers';

export default function sanitizeResMiddleware(
	_req: Request,
	res: Response,
	next: NextFunction
): void {
	const _send = res.send;

	function newSend<T>(body: T): Response<T> | void {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const sanitizedBody = sanitizeNumbers(body);

			return _send.call(res, sanitizedBody) as Response<T>;
		} catch {
			next(
				new InternalServerError(
					'Unknown failure while trying to sanitize the response body.'
				)
			);
		}
	}

	res.send = (newSend as unknown) as Send;

	return next();
}
