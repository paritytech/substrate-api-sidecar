// write tests that get the metadata from an rpc and then inject the metadata into the controller

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ISidecarConfig } from 'src/types/sidecar-config';

import { getControllers, specToControllerMap } from '../chains-config';
import { defaultControllers } from '../chains-config/defaultControllers';
import { controllers } from '.';

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 *
 * @param api ApiPromise to inject into controllers
 * @param implName
 */

const mockSidecarConfig: ISidecarConfig = {
	EXPRESS: {
		HOST: '',
		PORT: 3000,
		KEEP_ALIVE_TIMEOUT: 5000,
		MAX_BODY: '100kb',
		INJECTED_CONTROLLERS: false,
	},
	SUBSTRATE: {
		URL: '',
		MULTI_CHAIN_URL: [],
		TYPES_BUNDLE: '',
		TYPES_CHAIN: '',
		TYPES_SPEC: '',
		TYPES: '',
		CACHE_CAPACITY: 1000,
	},
	LOG: {
		LEVEL: 'info',
		JSON: false,
		FILTER_RPC: false,
		STRIP_ANSI: false,
		WRITE: false,
		WRITE_PATH: '',
		WRITE_MAX_FILE_SIZE: 0,
		WRITE_MAX_FILES: 0,
	},
	METRICS: {
		ENABLED: false,
		PROM_HOST: '',
		PROM_PORT: 0,
		LOKI_HOST: '',
		LOKI_PORT: 0,
		INCLUDE_QUERYPARAMS: false,
	},
};

const chainsToNode: Record<string, string> = {
	'asset-hub-kusama': 'wss://asset-hub-kusama-rpc.dwellir.com',
	kusama: 'wss://kusama-rpc.dwellir.com',
	'asset-hub-westend': 'wss://asset-hub-westend-rpc.dwellir.com',
	astar: 'wss://astar-rpc.dwellir.com',
	bifrost_polkadot: 'wss://bifrost-polkadot.ibp.network',
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
	jest.setTimeout(60000); // Increase timeout for async operations

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
					injectedControllers.add(controller.controllerName || controller.name);
				}
			});
			const controllersToInclude =
				specToControllerMap[chain]?.controllers.sort() || defaultControllers.controllers.sort();

			const filtered = controllersToInclude.filter((c) => !injectedControllers.has(c));
			expect(filtered).toHaveLength(0);
		});
	}

	it('should inject default controllers when pallets are not checked (injected-controllers: false) and a custom config is not available', async () => {
		const wsProvider = new WsProvider('wss://kusama-rpc.dwellir.com');
		const api = await ApiPromise.create({ provider: wsProvider });
		try {
			await api.isReady;
		} finally {
			await api?.disconnect(); // Close WebSocket connection
		}
		const pallets = (api.registry.metadata.toJSON().pallets as unknown as Record<string, unknown>[]).map(
			(p) => p.name as string,
		);
		const controllers = getControllers(
			{
				...mockSidecarConfig,
				EXPRESS: {
					...mockSidecarConfig.EXPRESS,
					INJECTED_CONTROLLERS: true,
				},
			},
			'mock_spec',
			pallets,
		);

		expect(controllers).toBeDefined();
		expect(controllers).not.toHaveLength(0);

		const controllersDefault = getControllers(
			{
				...mockSidecarConfig,
				EXPRESS: {
					...mockSidecarConfig.EXPRESS,
					INJECTED_CONTROLLERS: false,
				},
			},
			'mock_spec',
			[],
		);

		expect(controllersDefault).toBeDefined();
		expect(controllersDefault).toHaveLength(defaultControllers.controllers.length);
	});
});
