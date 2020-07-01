import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export default function httpErrorMiddleware(
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
