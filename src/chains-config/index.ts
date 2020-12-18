import { ApiPromise } from '@polkadot/api';
import AbstractController from 'src/controllers/AbstractController';
import { AbstractService } from 'src/services/AbstractService';

import { controllers } from '../controllers';
import { ControllerConfig } from '../types/chains-config';
import { defaultControllers } from './defaultControllers';
import { dockMainnetControllers } from './dockMainnetControllers';
import { dockTestnetControllers } from './dockTestnetControllers';
import { kulupuControllers } from './kulupuControllers';
import { mandalaControllers } from './mandalaControllers';

const specToControllerMap = {
	kulupu: kulupuControllers,
	mandala: mandalaControllers,
	'dock-testnet': dockTestnetControllers,
	'dock-main-runtime': dockMainnetControllers,
};

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 *
 * @param api ApiPromise to inject into controllers
 * @param implName
 */
export function getControllersForSpec(
	api: ApiPromise,
	specName: string
): AbstractController<AbstractService>[] {
	if (specToControllerMap[specName]) {
		return getControllersFromConfig(api, specToControllerMap[specName]);
	}

	// If we don't have the specName in the specToControllerMap we use the default
	// contoller config
	return getControllersFromConfig(api, defaultControllers);
}

/**
 * Return an array of instantiated controller instances based off of a
 * `ControllerConfig`.
 *
 * @param api ApiPromise to inject into controllers
 * @param config controller mount configuration object
 */
function getControllersFromConfig(api: ApiPromise, config: ControllerConfig) {
	// If we don't typecast here, tsc thinks its just [string, any][]
	const controllersToInclude = Object.entries(config.controllers) as [
		keyof typeof controllers,
		boolean
	][];

	return controllersToInclude.reduce((acc, [controllerName, shouldMount]) => {
		if (shouldMount) {
			acc.push(new controllers[controllerName](api, config.options));
		}

		return acc;
	}, [] as AbstractController<AbstractService>[]);
}
