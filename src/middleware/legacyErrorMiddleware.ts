import { NextFunction, Request, Response } from 'express';
import * as HttpErrorConstructor from 'http-errors';
import { InternalServerError } from 'http-errors';

import { BasicError, LegacyError } from '../types/error_types';

export default function httpErrorMiddleware(
	exception: BasicError | LegacyError,
	_req: Request,
	res: Response,
	next: NextFunction
): void {
	if (!('error' in exception)) {
		next(exception);
	}

	if ('statusCode' in exception) {
		res.status(exception.statusCode).send(
			HttpErrorConstructor(exception.statusCode, exception.error)
		);

		return;
	}

	res.status(500).send(new InternalServerError(exception.error));
}
