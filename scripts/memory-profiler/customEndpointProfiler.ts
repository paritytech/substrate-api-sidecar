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

import { IsolatedMemoryProfiler } from './IsolatedMemoryProfiler';

/**
 * Custom endpoint profiler for deep diving into specific endpoints or scenarios
 */
class CustomEndpointProfiler {
	private profiler: IsolatedMemoryProfiler;

	constructor(baseUrl = 'http://localhost:8080', config: any = {}) {
		this.profiler = new IsolatedMemoryProfiler({
			baseUrl,
			...config
		});
	}

	/**
	 * Test block ranges with different sizes to understand memory scaling
	 */
	async testBlockRangeScaling() {
		console.log('🔍 Testing Block Range Scaling');

		await this.profiler.testIsolatedEndpoint({
			endpoint: '/blocks/head',
			variations: [
				'',
				'?range=1',
				'?range=5',
				'?range=10',
				'?range=25',
				'?range=50',
				'?range=100'
			],
			iterations: 5,
			description: 'Block range scaling analysis - how memory grows with range size'
		});
	}

	/**
	 * Test specific historical blocks that might have different memory characteristics
	 */
	async testHistoricalBlocks() {
		console.log('🔍 Testing Historical Blocks');

		// Test blocks with potentially different characteristics
		const interestingBlocks = [
			'1',          // Genesis
			'1000000',    // Early block
			'5000000',    // Mid-range
			'10000000',   // More recent
			'15000000',   // Recent
			'head'        // Current
		];

		await this.profiler.testIsolatedEndpoint({
			endpoint: '/blocks/',
			variations: interestingBlocks,
			iterations: 4,
			description: 'Historical blocks analysis - memory patterns across blockchain history'
		});
	}

	/**
	 * Test account endpoints with different types of accounts (using e2e test addresses)
	 */
	async testAccountVariations() {
		console.log('🔍 Testing Account Variations');

		// Real account addresses from e2e tests
		const testAccounts = [
			'12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW', // Balance test account
			'12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm', // Staking test account
			'15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA', // Vesting test account
			'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc'  // Validation test account
		];

		for (const account of testAccounts) {
			await this.profiler.testIsolatedEndpoint({
				endpoint: `/accounts/${account}/balance-info`,
				variations: ['', '?denominated=true', '?at=19000000', '?at=18000000'],
				iterations: 3,
				description: `Balance info for account ${account.slice(0, 8)}... with denomination and different heights`
			});

			// Only test staking for known staking accounts
			if (account === '12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm') {
				await this.profiler.testIsolatedEndpoint({
					endpoint: `/accounts/${account}/staking-info`,
					variations: ['', '?at=19000000', '?at=18000000'],
					iterations: 3,
					description: `Staking info for account ${account.slice(0, 8)}... at different heights`
				});

				await this.profiler.testIsolatedEndpoint({
					endpoint: `/accounts/${account}/staking-payouts`,
					variations: ['', '?unclaimedOnly=false', '?at=19000000'],
					iterations: 3,
					description: `Staking payouts for account ${account.slice(0, 8)}... with filters`
				});
			}

			// Test vesting for vesting account
			if (account === '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA') {
				await this.profiler.testIsolatedEndpoint({
					endpoint: `/accounts/${account}/vesting-info`,
					variations: ['', '?at=19000000'],
					iterations: 3,
					description: `Vesting info for account ${account.slice(0, 8)}... at different heights`
				});
			}

			// Test address validation
			if (account === 'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc') {
				await this.profiler.testIsolatedEndpoint({
					endpoint: `/accounts/${account}/validate`,
					variations: [''],
					iterations: 3,
					description: `Address validation for account ${account.slice(0, 8)}...`
				});
			}
		}
	}

	/**
	 * Test pallet storage endpoints which can be memory intensive (using e2e test patterns)
	 */
	async testPalletStorage() {
		console.log('🔍 Testing Pallet Storage');

		// Test general pallet storage (case-sensitive as per e2e tests)
		const systemPalletTests = [
			{
				endpoint: '/pallets/System/storage',
				variations: ['?onlyIds=true', '?onlyIds=true&at=19000000', '?at=19000000'],
				description: 'System pallet storage with ID filtering'
			},
			{
				endpoint: '/pallets/System/storage/BlockWeight',
				variations: ['?metadata=true', '?metadata=true&at=19000000'],
				description: 'Specific storage item with metadata'
			}
		];

		const stakingPalletTests = [
			{
				endpoint: '/pallets/staking/validators',
				variations: ['', '?at=19000000', '?metadata=true'],
				description: 'Staking validators with metadata'
			},
			{
				endpoint: '/pallets/staking/progress',
				variations: ['', '?at=19000000'],
				description: 'Staking progress (can be memory intensive)'
			}
		];

		const palletMetadataTests = [
			{
				endpoint: '/pallets/MessageQueue/consts',
				variations: ['', '?at=19000000'],
				description: 'Pallet constants metadata'
			},
			{
				endpoint: '/pallets/balances/errors',
				variations: ['', '?at=19000000'],
				description: 'Pallet errors metadata'
			},
			{
				endpoint: '/pallets/balances/events',
				variations: ['', '?at=19000000'],
				description: 'Pallet events metadata'
			}
		];

		const allTests = [...systemPalletTests, ...stakingPalletTests, ...palletMetadataTests];

		for (const test of allTests) {
			await this.profiler.testIsolatedEndpoint({
				endpoint: test.endpoint,
				variations: test.variations,
				iterations: 3,
				description: test.description
			});
		}
	}

	/**
	 * Test runtime endpoints at different runtime versions
	 */
	async testRuntimeVersions() {
		console.log('🔍 Testing Runtime Versions');

		// Blocks with different runtime versions
		const runtimeVersionBlocks = [
			'1000000',    // Early runtime
			'5000000',    // Mid runtime
			'10000000',   // Later runtime
			'15000000',   // Recent runtime
			'head'        // Current runtime
		];

		await this.profiler.testIsolatedEndpoint({
			endpoint: '/runtime/metadata',
			variations: runtimeVersionBlocks.map(block => block === 'head' ? '' : `?at=${block}`),
			iterations: 3,
			description: 'Runtime metadata across different runtime versions'
		});

		await this.profiler.testIsolatedEndpoint({
			endpoint: '/runtime/spec',
			variations: runtimeVersionBlocks.map(block => block === 'head' ? '' : `?at=${block}`),
			iterations: 4,
			description: 'Runtime spec across different runtime versions'
		});
	}

	/**
	 * Stress test a specific endpoint
	 */
	async stressTestEndpoint(endpoint: string, variation: string = '', iterations: number = 20) {
		console.log(`🔥 Stress Testing: ${endpoint}${variation}`);

		await this.profiler.testIsolatedEndpoint({
			endpoint,
			variations: [variation],
			iterations,
			description: `Stress test - ${iterations} iterations of ${endpoint}${variation}`
		});
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2);
	const testType = args[0] || 'all';
	const baseUrl = args[1] || 'http://localhost:8080';

	console.log(`🔬 Custom Endpoint Memory Profiler`);
	console.log(`Target: ${baseUrl}`);
	console.log(`Test Type: ${testType}`);
	console.log(`GC Available: ${!!global.gc ? 'Yes ✅' : 'No (run with --expose-gc for better results)'}`);

	const profiler = new CustomEndpointProfiler(baseUrl);

	switch (testType) {
		case 'blocks':
			await profiler.testBlockRangeScaling();
			await profiler.testHistoricalBlocks();
			break;
		case 'accounts':
			await profiler.testAccountVariations();
			break;
		case 'pallets':
			await profiler.testPalletStorage();
			break;
		case 'runtime':
			await profiler.testRuntimeVersions();
			break;
		case 'stress':
			const endpoint = args[2] || '/blocks/head';
			const variation = args[3] || '';
			const iterations = parseInt(args[4]) || 20;
			await profiler.stressTestEndpoint(endpoint, variation, iterations);
			break;
		case 'all':
		default:
			console.log('Running all custom tests...');
			await profiler.testBlockRangeScaling();
			await profiler.testHistoricalBlocks();
			await profiler.testAccountVariations();
			await profiler.testPalletStorage();
			await profiler.testRuntimeVersions();
			break;
	}

	console.log('\n✅ Custom profiling completed!');
}

if (require.main === module) {
	main().catch(console.error);
}