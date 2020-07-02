import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import { BasicError, LegacyError, TxError } from './error_types';

/**
 * Non-error handling middleware
 */
export type NormalMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

/**
 * Error handling middleware
 */
export type ErrorMiddleware = (
	exception: Error | HttpError | BasicError | LegacyError | unknown | TxError,
	_req: Request,
	res: Response,
	next: NextFunction
) => void | Promise<void>;

/**
 * All known middleware types of sidecar.
 */
export type Middleware = NormalMiddleware | ErrorMiddleware;
