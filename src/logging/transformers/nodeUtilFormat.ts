import { TransformableInfo } from 'logform';
import { SPLAT } from 'triple-beam';
import util from 'util';
import { format } from 'winston';

/**
 * Console.log style formatting using node's `util.format`. We need this so we
 * can override console.{log, error, etc.} without issue.
 */
export const nodeUtilFormat = format(
	(info: TransformableInfo, _opts: unknown) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const args = info[(SPLAT as unknown) as string];
		if (args) {
			info.message = util.format(info.message, ...args);
		}
		return info;
	}
);
