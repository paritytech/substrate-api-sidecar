import { NextFunction, Request, Response } from 'express';

export type NormalMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;
