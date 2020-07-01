import { NextFunction, Request, Response } from 'express';
import { InternalServerError } from 'http-errors';

export default function internalErrorMiddleware(
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
