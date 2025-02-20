// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiPromise } from '@polkadot/api';
import { ISidecarConfig } from 'src/types/sidecar-config';

import { controllers } from '../controllers';
import AbstractController from '../controllers/AbstractController';
import { AbstractService } from '../services/AbstractService';
import { ControllerConfig } from '../types/chains-config';
import { acalaControllers } from './acalaControllers';
import { assetHubKusamaControllers } from './assetHubKusamaControllers';
import { assetHubPolkadotControllers } from './assetHubPolkadotControllers';
import { assetHubWestendControllers } from './assetHubWestendControllers';
import { astarControllers } from './astarControllers';
import { bifrostControllers } from './bifrostControllers';
import { bifrostPolkadotControllers } from './bifrostPolkadotControllers';
import { calamariControllers } from './calamariControllers';
import { coretimeControllers } from './coretimeControllers';
import { crustControllers } from './crustControllers';
import { defaultControllers } from './defaultControllers';
import { dockMainnetControllers } from './dockMainnetControllers';
import { dockPoSMainnetControllers } from './dockPoSMainnetControllers';
import { dockTestnetControllers } from './dockPoSTestnetControllers';
import { heikoControllers } from './heikoControllers';
import { karuraControllers } from './karuraControllers';
import { kiltControllers } from './kiltControllers';
import { kulupuControllers } from './kulupuControllers';
import { kusamaControllers } from './kusamaControllers';
import { mandalaControllers } from './mandalaControllers';
import { mantaControllers } from './mantaControllers';
import { parallelControllers } from './parallelControllers';
import { polkadotControllers } from './polkadotControllers';
import { polymeshControllers } from './polymeshControllers';
import { shidenControllers } from './shidenControllers';
import { soraControllers } from './soraControllers';
import { westendControllers } from './westendControllers';

export const specToControllerMap: { [x: string]: ControllerConfig } = {
	westend: westendControllers,
	polkadot: polkadotControllers,
	polymesh: polymeshControllers,
	kusama: kusamaControllers,
	kulupu: kulupuControllers,
	kilt: kiltControllers,
	mandala: mandalaControllers,
	'dock-main-runtime': dockMainnetControllers,
	'dock-pos-main-runtime': dockPoSMainnetControllers,
	'dock-pos-test-runtime': dockTestnetControllers,
	'asset-hub-kusama': assetHubKusamaControllers,
	'asset-hub-polkadot': assetHubPolkadotControllers,
	statemine: assetHubKusamaControllers,
	statemint: assetHubPolkadotControllers,
	westmine: assetHubKusamaControllers,
	'asset-hub-westend': assetHubWestendControllers,
	westmint: assetHubWestendControllers,
	shiden: shidenControllers,
	astar: astarControllers,
	sora: soraControllers,
	calamari: calamariControllers,
	karura: karuraControllers,
	acala: acalaControllers,
	manta: mantaControllers,
	crust: crustControllers,
	bifrost: bifrostControllers,
	bifrost_polkadot: bifrostPolkadotControllers,
	heiko: heikoControllers,
	parallel: parallelControllers,
	'coretime-westend': coretimeControllers,
	'coretime-polkadot': coretimeControllers,
	'coretime-kusama': coretimeControllers,
};

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 *
 * @param api ApiPromise to inject into controllers
 * @param implName
 */
export function getControllersForSpec(api: ApiPromise, specName: string): AbstractController<AbstractService>[] {
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
	const controllersToInclude = config.controllers;

	return controllersToInclude.reduce((acc, controller) => {
		acc.push(new controllers[controller](api, config.options));

		return acc;
	}, [] as AbstractController<AbstractService>[]);
}

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 * @param pallets pallets available to define controllers
 * @param api ApiPromise to inject into controllers
 * @param specName specName of chain to get options
 */

export const getControllersByPallets = (pallets: string[], api: ApiPromise, specName: string) => {
	const controllersSet: AbstractController<AbstractService>[] = [];
	const config = specToControllerMap?.[specName]?.options || defaultControllers?.options;

	Object.values(controllers).forEach((controller) => {
		if (controller.canInjectByPallets(pallets)) {
			controllersSet.push(new controller(api, config));
		}
	});

	return controllersSet;
};

export const getControllers = (
	api: ApiPromise,
	config: ISidecarConfig,
	specName: string,
): AbstractController<AbstractService>[] => {
	if (config.EXPRESS.INJECTED_CONTROLLERS) {
		console.log('here');
		return getControllersByPallets(
			(api.registry.metadata.toJSON().pallets as unknown as Record<string, unknown>[]).map((p) => p.name as string),
			api,
			specName,
		);
	} else {
		return getControllersForSpec(api, specName);
	}
};
