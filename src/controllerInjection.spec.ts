// write tests that get the metadata from an rpc and then inject the metadata into the controller

import { ApiPromise, WsProvider } from '@polkadot/api';

import { specToControllerMap } from './chains-config';
import { defaultControllers } from './chains-config/defaultControllers';
import { controllers } from './controllers';

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 *
 * @param api ApiPromise to inject into controllers
 * @param implName
 */

const chainsToNode: Record<string, string> = {
	'asset-hub-kusama': 'wss://asset-hub-kusama-rpc.dwellir.com',
	kusama: 'wss://kusama-rpc.dwellir.com',
	'asset-hub-westend': 'wss://asset-hub-westend-rpc.dwellir.com',
	astar: 'wss://astar-rpc.dwellir.com',
	bifrost_polkadot: 'wss://bifrost-polkadot-rpc.dwellir.com',
	calamari: 'wss://calamari.systems',
	polkadot: 'wss://polkadot-rpc.dwellir.com',
	'coretime-westend': 'wss://coretime-westend-rpc.dwellir.com',
	'coretime-polkadot': 'wss://sys.ibp.network/coretime-polkadot',
	crust: 'wss://crust-parachain.crustapps.net',
	karura: 'wss://karura-rpc.dwellir.com',
	manta: 'wss://ws.manta.systems',
	kilt: 'wss://kilt-rpc.dwellir.com',
	'asset-hub-polkadot': 'wss://asset-hub-polkadot-rpc.dwellir.com',
};

describe('controllerInjection', () => {
	jest.setTimeout(10000); // Increase timeout for async operations

	for (const [chain, nodeUrl] of Object.entries(chainsToNode)) {
		it(`should return the correct response for ${chain}`, async () => {
			const wsProvider = new WsProvider(nodeUrl);
			const api = await ApiPromise.create({ provider: wsProvider });
			try {
				await api.isReady;
			} finally {
				await api?.disconnect(); // Close WebSocket connection
			}

			const metadata = api.registry.metadata.toJSON();
			const pallets = (metadata.pallets as unknown as Record<string, unknown>[]).map((p) => p.name as string).sort();

			const injectedControllers = new Set<string>();
			// get controllers by pallets
			Object.values(controllers).forEach((controller) => {
				if (controller.canInjectByPallets(pallets)) {
					injectedControllers.add(controller.controllerName);
				}
			});
			const controllersToInclude =
				specToControllerMap[chain]?.controllers.sort() || defaultControllers.controllers.sort();

			const filtered = controllersToInclude.filter((c) => !injectedControllers.has(c));
			expect(filtered).toHaveLength(0);
		});
	}
});
