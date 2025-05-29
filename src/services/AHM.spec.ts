import { setupContext } from '@acala-network/chopsticks-testing';

describe('AHM', () => {
	it('should have correct initial state', async () => {
		const westendAH = await setupContext({
			endpoint: 'wss://westend-asset-hub-rpc.polkadot.io',
		});

		const westendRC = await setupContext({
			endpoint: 'wss://westend-rpc.polkadot.io',
		});

		console.log(westendAH.api.query);
		console.log(westendRC.api.query);

		// import services for staking, and then make sure they are running properly
	}, 5000000);
});
