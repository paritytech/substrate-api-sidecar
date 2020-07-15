import * as morgan from 'morgan';

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
export const allLoggerMiddleware = morgan('dev');
