import { NextFunction, Request, Response } from 'express-serve-static-core';
import { HttpError } from 'http-errors';

/**
 * Handle HttpError and Error type throws in the handler pipeline.
 *
 * @param exception Error passed down by middleware or handler.
 * @param _req Express Request
 * @param res Express Response
 * @param _next Express Next Function
 */
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
