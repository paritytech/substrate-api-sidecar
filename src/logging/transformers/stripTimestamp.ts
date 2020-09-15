import { TransformableInfo } from 'logform';
import { format } from 'winston';

/**
 * Regex that matches timestamps with the format of `YYYY-MM-DD HH:MM`
 */
const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;

/**
 * Slice out the timestamp from a message so it is not redundant with the winston
 * timestamp. This is for the polkadot-js console statements.
 */
export const stripTimestamp = format(
	(info: TransformableInfo, _opts: unknown) => {
		if (timestampRegex.exec(info?.message)) {
			info.message = info.message.slice(24).trim();
		}

		return info;
	}
);
