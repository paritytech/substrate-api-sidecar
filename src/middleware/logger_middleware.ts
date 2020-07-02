import { Request, Response } from 'express';
import * as morgan from 'morgan';
import { NormalMiddleware } from 'src/types/middleware_types';

export const productionLoggerMiddleware = morgan('combined', {
	skip: function (_: Request, res: Response) {
		return res.statusCode < 400; // Only log errors
	},
}) as NormalMiddleware;

export const developmentLoggerMiddleware = morgan('dev') as NormalMiddleware;
