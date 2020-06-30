import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export type NormalMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

export type ErrorMiddleware = (
	err: Error | HttpError,
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

export type Middleware = NormalMiddleware | ErrorMiddleware;
