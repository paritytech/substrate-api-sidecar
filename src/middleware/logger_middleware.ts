import { Request, RequestHandler, Response } from 'express';
import * as morgan from 'morgan';

/**
 * Only log errors in standard Apache combined log output.
 *
 * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version"
 * :status :res[content-length] ":referrer" ":user-agent"
 */
export const productionLoggerMiddleware = morgan('combined', {
	skip: function (_: Request, res: Response) {
		return res.statusCode < 400; // Only log errors
	},
}) as RequestHandler;

/**
 * Log everything.
 *
 * Concise output colored by response status for development use.
 * The :status token will be colored red for server error codes,
 * yellow for client error codes, cyan for redirection codes, and uncolored
 * for all other codes.
 *
 * :method :url :status :response-time ms - :res[content-length]
 */
export const developmentLoggerMiddleware = morgan('dev') as RequestHandler;
