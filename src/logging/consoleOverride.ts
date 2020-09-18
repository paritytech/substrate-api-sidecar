/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */

import { format } from 'util';
import { Logger } from 'winston';

/**
 * Override console methods with a winston.Logger.
 *
 * @param logger
 */
export function consoleOverride(logger: Logger): void {
	[
		['log', 'info'],
		['info', 'info'],
		['warn', 'warn'],
		['error', 'error'],
		['debug', 'debug'],
	].forEach(([consoleLevel, winstonLevel]) => {
		// Sacrereligious typecasting explained:
		//
		// `args as [string]`: format @types dictate that it needs an array of at least length 1. However,
		// from testing this is not neccesary, so we override the type as a string tuple.
		//
		// `(format.apply(format, args as [string]) as unknown) as object`: TS incorrectly says the we
		// need a object as an argument to `info.call`. However, it will accept a string perfectly fine,
		// which is what `format.apply` returns.
		console[consoleLevel] = function (...args: unknown[]) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			logger[winstonLevel].call(
				logger,
				(format.apply(format, args as [string]) as unknown) as object
			);
		};
	});
}
