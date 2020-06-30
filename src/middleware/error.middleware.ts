import { NextFunction, Request, Response } from 'express';

import HttpException from '../exceptions/HttpException';

export default function errorMiddleware(
	exception: HttpException,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	const code = exception.statusCode || 500;
	const message = exception.statusMessage || 'Internal Error';
	res.status(code).send({
		message,
		code,
	});
}
