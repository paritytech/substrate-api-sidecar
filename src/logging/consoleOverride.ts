/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */

import { format } from 'util';
import { Logger } from 'winston';

/**
 * Override console methods with a Winston.Logger.
 *
 * @param logger
 */
export function consoleOverride(logger: Logger): void {
	console.log = function (...args: unknown[]) {
		// Sacrereligious typecasting explained:
		//
		// `args as [string]`: fomat @types dictate that it needs an array of at least length 1. However,
		// from testing this is not neccesary, so we override the type as a string tuple.
		//
		// `(format.apply(format, args as [string]) as unknown) as object: TS incorrectly says the we
		// need a object as an argument to `info.call`. However, it will except a string perfectly fine,
		// which is what `format.apply` returns.
		logger.info.call(
			logger,
			(format.apply(format, args as [string]) as unknown) as object
		);
	};
	console.info = function (...args: unknown[]) {
		logger.info.call(
			logger,
			(format.apply(format, args as [string]) as unknown) as object
		);
	};
	console.warn = function (...args: unknown[]) {
		logger.warn.call(
			logger,
			(format.apply(format, args as [string]) as unknown) as object
		);
	};
	console.error = function (...args: unknown[]) {
		logger.error.call(
			logger,
			(format.apply(format, args as [string]) as unknown) as object
		);
	};
	console.debug = function (...args: unknown[]) {
		logger.debug.call(
			logger,
			(format.apply(format, args as [string]) as unknown) as object
		);
	};
}
