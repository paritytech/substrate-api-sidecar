import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { InternalServerError } from 'http-errors';

import { Log } from '../../logging/Log';

const MAX_CONNECTION_ATTEMPTS = 30;

const delay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Before each request in sidecar, we make sure the api is connected. 
 * If it is isnt, we attempt to reconnect manually reconnect
 * 
 * @param api ApiPromise
 */
export const isConnectedMiddleware = (api: ApiPromise): RequestHandler => {
	return async (_req, _res, next) => {
        /**
         * Check to see if the API-WS is connected
         */
		if (!api.isConnected) {
			Log.logger.error(
				'API-WS: disconnected, attempting to manually reconnect...'
			);
			const attempReconnect = await reconnectApi(api);

			if (attempReconnect) {
				Log.logger.info('API-WS has succesfully reconnected');
				/**
				 * Time buffer to allow polkadot-js to re-enable itself
				 */
				await api.isReady

				return next();
			} else {
				throw new InternalServerError(
					`Tried connecting to ${api}`
				);
			}
		}

		return next();
	};
};

const reconnectApi = async (
	api: ApiPromise,
	reconnectAttemps = 0
): Promise<boolean> => {
	/**
	 * Ensure disconnection before attempting to reconnect, avoiding conflict with the underlying api trying to reconnect
	 */
	if (reconnectAttemps === 0) {
		Log.logger.warn(
			'Disconnecting the polkadot-js API-WS. Sidecar will be disabled shortly as it attempts to reconnect'
		);
	}
	await api.disconnect().catch((err) => {
		throw new InternalServerError(err);
	});

	/**
	 * Attemp to reconnect to the api.
	 */
	Log.logger.warn('Attemping to reconnect to polkadot-js api.');
	await api.connect().catch((err) => {
		throw new InternalServerError(err);
	});

	const checkConnection = api.isConnected;

	if (checkConnection) {
		return true;
	} else {
		await delay(1500);

		/**
		 * Sanity check to make sure the api under the hood hasnt connected
		 */
		if (api.isConnected) return true;

		/**
		 * Recursively attempt to reconnect to the Api
		 */
		if (reconnectAttemps < MAX_CONNECTION_ATTEMPTS) {
			return reconnectApi(api, reconnectAttemps + 1);
        }

		return false;
	}
};
