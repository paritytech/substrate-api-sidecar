import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export default function errorMiddleware(
	exception: HttpError | Error,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	const code = exception instanceof HttpError ? exception.status : 500;
	res.status(code).send({
		code,
		message: exception?.message ?? 'Internal Error',
		stack: exception.stack,
	});
}
