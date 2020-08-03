// TODO look into creating a base class for transactions and move this into that base class

import { isToString } from '../../types/util';

export function extractCauseAndStack(
	err: unknown
): { cause: string | unknown; stack: string | undefined } {
	const cause =
		err instanceof Error
			? err.message
			: isToString(err)
			? err.toString()
			: err;

	const stack = err instanceof Error ? err.stack : '';

	return { cause, stack };
}
