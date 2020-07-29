import { Request, RequestHandler, Response } from 'express';
import * as morgan from 'morgan';

/**
 * Only log errors in standard Apache combined log output.
 *
 * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version"
 * :status :res[content-length] ":referrer" ":user-agent"
 */
export const errorLoggerMiddleware = morgan('combined', {
	skip: function (_: Request, res: Response) {
		return res.statusCode < 400; // Only log errors
	},
}) as RequestHandler;
