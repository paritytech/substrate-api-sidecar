// write tests that get the metadata from an rpc and then inject the metadata into the controller

import { ApiPromise, WsProvider } from '@polkadot/api';

import { commonControllers } from './chains-config';
import { controllers } from './controllers';

/**
 * Return an array of instantiated controller instances based off of a `specName`.
 *
 * @param api ApiPromise to inject into controllers
 * @param implName
 */

const chainsToNode: Record<string, string> = {
	acala: 'wss://acala-rpc.dwellir.com',
	kusama_asset_hub: 'wss://asset-hub-kusama-rpc.dwellir.com',
	kusama: 'wss://kusama-rpc.dwellir.com',
	westend_asset_hub: 'wss://asset-hub-westend-rpc.dwellir.com',
	astar: 'wss://astar-rpc.dwellir.com',
	bifrost_kusama: 'wss://bifrost-rpc.dwellir.com',
	bifrost_polkadot: 'wss://bifrost-polkadot-rpc.dwellir.com',
	calamari: 'wss://calamari.systems',
	coretime_polkadot: 'wss://sys.ibp.network/coretime-polkadot',
	coretime_kusama: 'wss://rpc-coretime-kusama.luckyfriday.io',
	coretime_westend: 'wss://coretime-westend-rpc.dwellir.com',
	crust: 'wss://crust-parachain.crustapps.net',
	karura: 'wss://karura-rpc.dwellir.com',
	manta: 'wss://ws.manta.systems',
	kilt: 'wss://kilt-rpc.dwellir.com',
	parallel: 'wss://parallel.gatotech.network',
	shiden: 'wss://shiden-rpc.dwellir.com',
	sora: 'wss://ws.parachain-collator-3.pc3.sora2.soramitsu.co.jp',
	westend: 'wss://westend-rpc.polkadot.io',
	polkadot: 'wss://polkadot-rpc.dwellir.com',
	polkadot_asset_hub: 'wss://asset-hub-polkadot-rpc.dwellir.com',
};

describe('controllerInjection', () => {
	jest.setTimeout(60000); // Increase timeout for async operations
	it('should return the correct response with the assets param', async () => {
		const results: { chain: string; pallets: string[] }[] = [];

		await Promise.all(
			Object.entries(chainsToNode).map(async ([chain, nodeUrl]) => {
				const wsProvider = new WsProvider(nodeUrl);
				try {
					const api = await ApiPromise.create({ provider: wsProvider });
					await api.isReady;

					const metadata = api.registry.metadata.toJSON();
					const pallets = (metadata.pallets as unknown as Record<string, unknown>[]).map((p) => p.name as string);

					results.push({ chain, pallets });

					await api.disconnect(); // Close WebSocket connection
				} catch (error) {
					console.error(`Failed to fetch metadata for ${chain}:`, error);
				} finally {
					await wsProvider.disconnect(); // Ensure disconnection
				}
			}),
		);

		const common = commonControllers();

		expect(common).toBeDefined();

		for (const result of results) {
			console.log(`Pallets for ${result.chain}:`, result.pallets);
			const injectedControllers: string[] = [];
			// get controllers by pallets
			Object.values(controllers).forEach((controller) => {
				if (!controller.requiredPallets.length) {
					injectedControllers.push(controller.name);
				} else if (controller.requiredPallets.every((p) => result.pallets.includes(p))) {
					injectedControllers.push(controller.name);
				}
			});

			console.log(injectedControllers);
		}
	});
});
