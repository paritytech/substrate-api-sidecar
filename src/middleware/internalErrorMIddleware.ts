import { NextFunction, Request, Response, response } from 'express';
import { HttpError, InternalServerError } from 'http-errors';

export default function httpErrorMiddleware(
	_exception: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	res.status(500).send(new InternalServerError('Internal Error'));
}
