import { TransformableInfo } from 'logform';
import { format } from 'winston';

/**
 * Ignore log messages that have `API-WS:`. (e.g. polkadot-js RPC logging)
 */
export const filterApiRpc = format(
	(info: TransformableInfo, _opts: unknown) => {
		if (
			!info ||
			(info?.message?.includes &&
				!info?.message?.includes('connected') &&
				info.message?.includes('API-WS:') &&
				info.level === 'info')
		) {
			return false;
		}

		return info;
	}
);
