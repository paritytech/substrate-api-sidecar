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

import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface MemorySnapshot {
	timestamp: number;
	heapUsed: number;
	heapTotal: number;
	rss: number;
	external: number;
	arrayBuffers: number;
}

interface EndpointTest {
	endpoint: string;
	variations: string[];
	iterations: number;
	description: string;
}

interface IsolatedResult {
	endpoint: string;
	variation: string;
	iteration: number;
	statusCode: number;
	responseTime: number;
	memoryBefore: MemorySnapshot;
	memoryAfter: MemorySnapshot;
	memoryDelta: number;
	responseSize: number;
	gcBefore?: MemorySnapshot;
	gcAfter?: MemorySnapshot;
}

interface EndpointAnalysis {
	endpoint: string;
	totalTests: number;
	memoryStats: {
		avgDelta: number;
		maxDelta: number;
		minDelta: number;
		totalGrowth: number;
		leakSuspicion: number; // 0-1 score
	};
	performanceStats: {
		avgResponseTime: number;
		maxResponseTime: number;
		avgResponseSize: number;
	};
	variations: Map<string, {
		avgDelta: number;
		avgResponseTime: number;
		avgResponseSize: number;
	}>;
}

interface ProfilerConfig {
	baseUrl?: string;
	outputDir?: string;
	coolOffPeriod?: number; // milliseconds between endpoint tests
	iterationCoolOff?: number; // milliseconds between iterations
	variationCoolOff?: number; // milliseconds between variations
	enableGCAnalysis?: boolean;
}

export class IsolatedMemoryProfiler {
	private baseUrl: string;
	private outputDir: string;
	private results: Map<string, IsolatedResult[]> = new Map();
	private config: Required<ProfilerConfig>;

	constructor(config: ProfilerConfig = {}) {
		this.config = {
			baseUrl: config.baseUrl || 'http://localhost:8080',
			outputDir: config.outputDir || './memory-profiles',
			coolOffPeriod: config.coolOffPeriod || 5000, // 5 seconds between endpoints
			iterationCoolOff: config.iterationCoolOff || 300, // 300ms between iterations
			variationCoolOff: config.variationCoolOff || 1500, // 1.5 seconds between variations
			enableGCAnalysis: config.enableGCAnalysis !== false // enabled by default
		};

		this.baseUrl = this.config.baseUrl;
		this.outputDir = this.config.outputDir;
		mkdirSync(this.outputDir, { recursive: true });
	}

	private takeMemorySnapshot(): MemorySnapshot {
		const usage = process.memoryUsage();
		return {
			timestamp: Date.now(),
			heapUsed: usage.heapUsed,
			heapTotal: usage.heapTotal,
			rss: usage.rss,
			external: usage.external,
			arrayBuffers: usage.arrayBuffers
		};
	}

	private async forceGC(): Promise<MemorySnapshot | undefined> {
		if (global.gc && this.config.enableGCAnalysis) {
			// Run GC multiple times to be thorough
			global.gc();
			global.gc();
			global.gc();
			await new Promise(resolve => setTimeout(resolve, 100));
			return this.takeMemorySnapshot();
		}
		return undefined;
	}

	private async coolOffPeriod(duration: number, description: string): Promise<void> {
		if (duration > 0) {
			process.stdout.write(`    ${description} (${duration}ms)...`);
			await new Promise(resolve => setTimeout(resolve, duration));
			console.log(' ✓');
		}
	}

	private async performGCAnalysis(): Promise<{ before: MemorySnapshot | undefined; after: MemorySnapshot | undefined }> {
		if (!this.config.enableGCAnalysis) {
			return { before: undefined, after: undefined };
		}

		const before = await this.forceGC();

		// Additional cool-off after GC to let memory settle
		await new Promise(resolve => setTimeout(resolve, 200));

		const after = this.takeMemorySnapshot();

		return { before, after };
	}

	private async callEndpoint(url: string, method = 'GET'): Promise<Omit<IsolatedResult, 'endpoint' | 'variation' | 'iteration'>> {
		// Force GC before measurement
		const gcBefore = await this.forceGC();

		const memoryBefore = this.takeMemorySnapshot();
		const startTime = performance.now();

		try {
			const response = await fetch(url, { method });
			const responseText = await response.text();
			const endTime = performance.now();

			const memoryAfter = this.takeMemorySnapshot();
			const gcAfter = await this.forceGC();

			return {
				statusCode: response.status,
				responseTime: endTime - startTime,
				memoryBefore,
				memoryAfter,
				memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
				responseSize: Buffer.byteLength(responseText, 'utf8'),
				gcBefore,
				gcAfter
			};
		} catch (error) {
			const endTime = performance.now();
			const memoryAfter = this.takeMemorySnapshot();
			const gcAfter = await this.forceGC();

			return {
				statusCode: 0,
				responseTime: endTime - startTime,
				memoryBefore,
				memoryAfter,
				memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
				responseSize: 0,
				gcBefore,
				gcAfter
			};
		}
	}

	async testIsolatedEndpoint(test: EndpointTest): Promise<void> {
		console.log(`\n🔬 Testing endpoint: ${test.endpoint}`);
		console.log(`   Description: ${test.description}`);
		console.log(`   Variations: ${test.variations.length}, Iterations per variation: ${test.iterations}`);

		const endpointResults: IsolatedResult[] = [];

		for (const [varIndex, variation] of test.variations.entries()) {
			console.log(`\n  📊 Testing variation ${varIndex + 1}/${test.variations.length}: ${variation}`);

			// Build full URL
			const fullUrl = `${this.baseUrl}${test.endpoint}${variation}`;

			for (let iteration = 0; iteration < test.iterations; iteration++) {
				process.stdout.write(`    Iteration ${iteration + 1}/${test.iterations}...`);

				const result = await this.callEndpoint(fullUrl);

				endpointResults.push({
					endpoint: test.endpoint,
					variation,
					iteration,
					...result
				});

				console.log(` ✓ (${result.responseTime.toFixed(0)}ms, ${(result.memoryDelta / 1024).toFixed(1)}KB)`);

				// Cool-off between iterations (allow GC to run)
				if (iteration < test.iterations - 1) {
					await this.coolOffPeriod(this.config.iterationCoolOff, 'Iteration cool-off');
				}
			}

			// Cool-off between variations to let system settle
			if (varIndex < test.variations.length - 1) {
				await this.coolOffPeriod(this.config.variationCoolOff, 'Variation cool-off & GC');

				// Perform GC analysis between variations
				const gcAnalysis = await this.performGCAnalysis();
				if (gcAnalysis.before && gcAnalysis.after) {
					const gcReclaimed = gcAnalysis.before.heapUsed - gcAnalysis.after.heapUsed;
					if (gcReclaimed > 0) {
						console.log(`    GC reclaimed: ${(gcReclaimed / 1024).toFixed(1)}KB`);
					}
				}
			}
		}

		this.results.set(test.endpoint, endpointResults);

		// Generate immediate analysis for this endpoint
		this.analyzeEndpoint(test.endpoint);
	}

	private analyzeEndpoint(endpoint: string): EndpointAnalysis {
		const results = this.results.get(endpoint) || [];

		if (results.length === 0) {
			throw new Error(`No results found for endpoint: ${endpoint}`);
		}

		// Group by variation
		const byVariation = new Map<string, IsolatedResult[]>();
		results.forEach(result => {
			if (!byVariation.has(result.variation)) {
				byVariation.set(result.variation, []);
			}
			byVariation.get(result.variation)!.push(result);
		});

		// Calculate memory statistics
		const deltas = results.map(r => r.memoryDelta);
		const responseTimes = results.map(r => r.responseTime);
		const responseSizes = results.map(r => r.responseSize);

		// Calculate leak suspicion (growing trend)
		const leakSuspicion = this.calculateMemoryLeakSuspicion(results);

		// Variation analysis
		const variationStats = new Map<string, any>();
		byVariation.forEach((varResults, variation) => {
			variationStats.set(variation, {
				avgDelta: varResults.reduce((sum, r) => sum + r.memoryDelta, 0) / varResults.length,
				avgResponseTime: varResults.reduce((sum, r) => sum + r.responseTime, 0) / varResults.length,
				avgResponseSize: varResults.reduce((sum, r) => sum + r.responseSize, 0) / varResults.length,
			});
		});

		const analysis: EndpointAnalysis = {
			endpoint,
			totalTests: results.length,
			memoryStats: {
				avgDelta: deltas.reduce((a, b) => a + b, 0) / deltas.length,
				maxDelta: Math.max(...deltas),
				minDelta: Math.min(...deltas),
				totalGrowth: deltas.reduce((a, b) => a + b, 0),
				leakSuspicion
			},
			performanceStats: {
				avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
				maxResponseTime: Math.max(...responseTimes),
				avgResponseSize: responseSizes.reduce((a, b) => a + b, 0) / responseSizes.length,
			},
			variations: variationStats
		};

		this.printEndpointAnalysis(analysis);
		return analysis;
	}

	private calculateMemoryLeakSuspicion(results: IsolatedResult[]): number {
		// Sort by timestamp to ensure chronological order
		const sortedResults = results.sort((a, b) => a.memoryBefore.timestamp - b.memoryBefore.timestamp);

		// Look at memory progression over time
		const heapProgression = sortedResults.map(r => r.memoryAfter.heapUsed);

		// Calculate trend: how much memory consistently increases
		let increases = 0;
		for (let i = 1; i < heapProgression.length; i++) {
			if (heapProgression[i] > heapProgression[i-1]) {
				increases++;
			}
		}

		return increases / (heapProgression.length - 1);
	}

	private printEndpointAnalysis(analysis: EndpointAnalysis): void {
		console.log(`\n📋 ANALYSIS FOR ${analysis.endpoint}`);
		console.log('='.repeat(50));

		// Memory analysis
		console.log(`🧠 Memory Impact:`);
		console.log(`   Average Delta: ${(analysis.memoryStats.avgDelta / 1024).toFixed(2)} KB`);
		console.log(`   Max Delta: ${(analysis.memoryStats.maxDelta / 1024).toFixed(2)} KB`);
		console.log(`   Total Growth: ${(analysis.memoryStats.totalGrowth / 1024).toFixed(2)} KB`);
		console.log(`   Leak Suspicion: ${(analysis.memoryStats.leakSuspicion * 100).toFixed(1)}% ${this.getLeakSuspicionEmoji(analysis.memoryStats.leakSuspicion)}`);

		// Performance analysis
		console.log(`⚡ Performance:`);
		console.log(`   Average Response Time: ${analysis.performanceStats.avgResponseTime.toFixed(2)} ms`);
		console.log(`   Max Response Time: ${analysis.performanceStats.maxResponseTime.toFixed(2)} ms`);
		console.log(`   Average Response Size: ${(analysis.performanceStats.avgResponseSize / 1024).toFixed(2)} KB`);

		// Variation breakdown
		console.log(`🔍 Variations:`);
		analysis.variations.forEach((stats, variation) => {
			console.log(`   ${variation}:`);
			console.log(`     Memory: ${(stats.avgDelta / 1024).toFixed(2)} KB`);
			console.log(`     Time: ${stats.avgResponseTime.toFixed(2)} ms`);
			console.log(`     Size: ${(stats.avgResponseSize / 1024).toFixed(2)} KB`);
		});
	}

	private getLeakSuspicionEmoji(suspicion: number): string {
		if (suspicion > 0.8) return '🚨';
		if (suspicion > 0.6) return '⚠️';
		if (suspicion > 0.4) return '⚠️';
		return '✅';
	}

	async runIsolatedSuite(): Promise<void> {
		console.log('🚀 Starting Isolated Memory Profiling Suite');
		console.log('============================================');

		// Get some recent block numbers for testing
		try {
			const headResponse = await fetch(`${this.baseUrl}/blocks/head`);
			const headBlock = await headResponse.json();
			const currentBlock = parseInt(headBlock.number);

			const testBlocks = [
				currentBlock,
				currentBlock - 100,
				currentBlock - 1000,
				currentBlock - 10000,
				1000000,  // Historical block
				5000000   // Another historical block
			];

			const tests: EndpointTest[] = [
				// Basic endpoints
				{
					endpoint: '/',
					variations: [''],
					iterations: 3,
					description: 'Root endpoint with available routes'
				},
				{
					endpoint: '/node/version',
					variations: [''],
					iterations: 3,
					description: 'Node version information'
				},
				{
					endpoint: '/node/network',
					variations: [''],
					iterations: 3,
					description: 'Network information'
				},
				{
					endpoint: '/node/transaction-pool',
					variations: ['', '?includeFee=true'],
					iterations: 3,
					description: 'Transaction pool with fee information'
				},
				// Block endpoints (from e2e tests)
				{
					endpoint: '/blocks/head',
					variations: ['', '?eventDocs=true&extrinsicDocs=true'],
					iterations: 4,
					description: 'Head block with documentation flags'
				},
				{
					endpoint: '/blocks/',
					variations: testBlocks.map(block => `${block}?eventDocs=true&extrinsicDocs=true`),
					iterations: 3,
					description: 'Specific blocks with documentation across heights'
				},
				{
					endpoint: '/blocks/',
					variations: testBlocks.map(block => `${block}/header`),
					iterations: 3,
					description: 'Block headers across different heights'
				},
				{
					endpoint: '/blocks/',
					variations: testBlocks.map(block => `${block}/extrinsics-raw`),
					iterations: 3,
					description: 'Raw extrinsics across different heights'
				},
				// Range blocks (memory intensive)
				{
					endpoint: '/blocks',
					variations: ['?range=1-2', '?range=1-5', '?range=1-10'],
					iterations: 3,
					description: 'Block ranges - memory scaling test'
				},
				// Account endpoints (using real addresses from e2e tests)
				{
					endpoint: '/accounts/12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW/balance-info',
					variations: ['', '?denominated=true', `?at=${currentBlock}`, `?at=${currentBlock - 1000}`],
					iterations: 4,
					description: 'Account balance info with denomination and different heights'
				},
				{
					endpoint: '/accounts/12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm/staking-info',
					variations: ['', `?at=${currentBlock}`, `?at=${currentBlock - 1000}`],
					iterations: 3,
					description: 'Account staking info at different heights'
				},
				{
					endpoint: '/accounts/12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm/staking-payouts',
					variations: ['', `?at=${currentBlock}`, '?unclaimedOnly=false'],
					iterations: 3,
					description: 'Account staking payouts with unclaimed filter'
				},
				{
					endpoint: '/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Account vesting information'
				},
				{
					endpoint: '/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/validate',
					variations: [''],
					iterations: 3,
					description: 'Account address validation'
				},
				// Runtime endpoints (from e2e tests)
				{
					endpoint: '/runtime/metadata',
					variations: ['', `?at=${currentBlock}`, `?at=${currentBlock - 1000}`, `?at=${currentBlock - 10000}`],
					iterations: 3,
					description: 'Runtime metadata at different block heights'
				},
				{
					endpoint: '/runtime/spec',
					variations: ['', `?at=${currentBlock}`, `?at=${currentBlock - 5000}`, `?at=${1000000}`],
					iterations: 4,
					description: 'Runtime spec across different runtime versions'
				},
				{
					endpoint: '/runtime/code',
					variations: ['', `?at=${currentBlock}`, `?at=${currentBlock - 1000}`],
					iterations: 3,
					description: 'Runtime code at different heights'
				},
				// Pallet endpoints (from e2e tests)
				{
					endpoint: '/pallets/System/storage',
					variations: ['?onlyIds=true', `?onlyIds=true&at=${currentBlock}`, `?at=${currentBlock}`],
					iterations: 3,
					description: 'System pallet storage with ID filtering'
				},
				{
					endpoint: '/pallets/System/storage/BlockWeight',
					variations: ['?metadata=true', `?metadata=true&at=${currentBlock}`],
					iterations: 3,
					description: 'Specific storage item with metadata'
				},
				{
					endpoint: '/pallets/staking/validators',
					variations: ['', `?at=${currentBlock}`, '?metadata=true'],
					iterations: 3,
					description: 'Staking validators with metadata'
				},
				{
					endpoint: '/pallets/staking/progress',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Staking progress information'
				},
				// Pallet constants, errors, events (from e2e tests)
				{
					endpoint: '/pallets/MessageQueue/consts',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Pallet constants'
				},
				{
					endpoint: '/pallets/balances/errors',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Pallet errors'
				},
				{
					endpoint: '/pallets/balances/events',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Pallet events'
				},
				// Transaction endpoints
				{
					endpoint: '/transaction/material',
					variations: [''],
					iterations: 3,
					description: 'Transaction material for building transactions'
				},
				// Paras endpoints (from e2e tests)
				{
					endpoint: '/paras',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Parachains information'
				},
				{
					endpoint: '/paras/head/included-candidates',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Included parachain candidates'
				},
				// Nomination pools
				{
					endpoint: '/pallets/nomination-pools/info',
					variations: ['', `?at=${currentBlock}`],
					iterations: 3,
					description: 'Nomination pools information'
				}
			];

			// Run each test in isolation
			for (const [index, test] of tests.entries()) {
				console.log(`\n🎯 Test ${index + 1}/${tests.length}`);
				await this.testIsolatedEndpoint(test);

				// Extended cool-off between different endpoints for system recovery
				if (index < tests.length - 1) {
					await this.coolOffPeriod(this.config.coolOffPeriod, 'Endpoint cool-off & system recovery');

					// Major GC analysis between endpoints
					console.log('    Performing comprehensive GC analysis...');
					const gcAnalysis = await this.performGCAnalysis();
					if (gcAnalysis.before && gcAnalysis.after) {
						const gcReclaimed = gcAnalysis.before.heapUsed - gcAnalysis.after.heapUsed;
						const gcEfficiency = (gcReclaimed / gcAnalysis.before.heapUsed) * 100;
						console.log(`    📊 GC Analysis: ${(gcReclaimed / 1024).toFixed(1)}KB reclaimed (${gcEfficiency.toFixed(1)}% efficiency)`);
					}
				}
			}

			// Generate comprehensive report
			this.generateComprehensiveReport();
		} catch (error) {
			console.error('Error during profiling suite:', error);
			throw error;
		}
	}

	private generateComprehensiveReport(): void {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

		// Analyze all endpoints
		const analyses: EndpointAnalysis[] = [];
		this.results.forEach((_, endpoint) => {
			analyses.push(this.analyzeEndpoint(endpoint));
		});

		// Sort by memory impact
		analyses.sort((a, b) => b.memoryStats.totalGrowth - a.memoryStats.totalGrowth);

		const report = {
			timestamp,
			summary: this.generateSummary(analyses),
			endpointAnalyses: analyses,
			rawResults: Object.fromEntries(this.results)
		};

		// Save comprehensive report
		const reportPath = join(this.outputDir, `isolated-memory-report-${timestamp}.json`);
		writeFileSync(reportPath, JSON.stringify(report, null, 2));

		// Generate endpoint-specific CSV files
		this.results.forEach((results, endpoint) => {
			const csvPath = join(this.outputDir, `${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.csv`);
			this.generateEndpointCSV(results, csvPath);
		});

		this.printComprehensiveSummary(report.summary, analyses);
		console.log(`\n📄 Comprehensive report saved to: ${reportPath}`);
	}

	private generateSummary(analyses: EndpointAnalysis[]) {
		const totalMemoryGrowth = analyses.reduce((sum, a) => sum + a.memoryStats.totalGrowth, 0);
		const suspiciousEndpoints = analyses.filter(a => a.memoryStats.leakSuspicion > 0.6);
		const heaviestEndpoint = analyses[0]; // Already sorted by memory impact

		return {
			totalEndpoints: analyses.length,
			totalMemoryGrowth,
			suspiciousEndpoints: suspiciousEndpoints.length,
			heaviestEndpoint: heaviestEndpoint.endpoint,
			averageMemoryPerEndpoint: totalMemoryGrowth / analyses.length
		};
	}

	private generateEndpointCSV(results: IsolatedResult[], csvPath: string): void {
		const headers = [
			'endpoint', 'variation', 'iteration', 'statusCode', 'responseTime', 'responseSize',
			'memoryDelta', 'heapBefore', 'heapAfter', 'gcBefore', 'gcAfter', 'timestamp'
		];

		const rows = results.map(r => [
			r.endpoint,
			r.variation,
			r.iteration,
			r.statusCode,
			r.responseTime.toFixed(2),
			r.responseSize,
			r.memoryDelta,
			r.memoryBefore.heapUsed,
			r.memoryAfter.heapUsed,
			r.gcBefore?.heapUsed || '',
			r.gcAfter?.heapUsed || '',
			r.memoryAfter.timestamp
		]);

		const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
		writeFileSync(csvPath, csv);
	}

	private printComprehensiveSummary(summary: any, analyses: EndpointAnalysis[]): void {
		console.log('\n🎯 COMPREHENSIVE MEMORY ANALYSIS SUMMARY');
		console.log('=========================================');
		console.log(`Total Endpoints Tested: ${summary.totalEndpoints}`);
		console.log(`Total Memory Growth: ${(summary.totalMemoryGrowth / 1024 / 1024).toFixed(2)} MB`);
		console.log(`Suspicious Endpoints: ${summary.suspiciousEndpoints} ${summary.suspiciousEndpoints > 0 ? '🚨' : '✅'}`);
		console.log(`Heaviest Endpoint: ${summary.heaviestEndpoint}`);

		console.log('\n🏆 TOP MEMORY CONSUMERS:');
		analyses.slice(0, 5).forEach((analysis, index) => {
			console.log(`${index + 1}. ${analysis.endpoint}: ${(analysis.memoryStats.totalGrowth / 1024).toFixed(2)} KB`);
		});

		console.log('\n🚨 LEAK SUSPICIOUS ENDPOINTS:');
		const suspicious = analyses.filter(a => a.memoryStats.leakSuspicion > 0.6);
		if (suspicious.length === 0) {
			console.log('   None detected ✅');
		} else {
			suspicious.forEach(analysis => {
				console.log(`   ${analysis.endpoint}: ${(analysis.memoryStats.leakSuspicion * 100).toFixed(1)}% suspicion`);
			});
		}
	}
}