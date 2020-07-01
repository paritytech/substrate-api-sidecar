import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import { BasicError, LegacyError } from './error_types';

export type NormalMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

export type ErrorMiddleware = (
	err: Error | HttpError,
	_req: Request,
	res: Response,
	next: NextFunction
) => void | Promise<void>;

export type LegacyErrorMiddleware = (
	err: LegacyError | BasicError,
	_req: Request,
	res: Response,
	next: NextFunction
) => void | Promise<void>;

export type internalErrorMiddleware = (
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction
) => void | Promise<void>;

export type Middleware =
	| NormalMiddleware
	| ErrorMiddleware
	| LegacyErrorMiddleware
	| internalErrorMiddleware;
