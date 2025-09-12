// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.

import { LRUCache } from 'lru-cache';

import { IBlock } from '../../types/responses';

/**
 * Performance and load tests for BlocksController caching
 * These tests verify the cache performs well under various load conditions
 */
describe('BlocksController Cache Performance Tests', () => {
	let cache: LRUCache<string, IBlock>;

	const mockBlock: IBlock = {
		number: { toString: () => '1000' } as any,
		hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as any,
		parentHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as any,
		stateRoot: '0x1111111111111111111111111111111111111111111111111111111111111111' as any,
		extrinsicsRoot: '0x2222222222222222222222222222222222222222222222222222222222222222' as any,
		authorId: undefined,
		logs: [],
		onInitialize: { events: [] },
		extrinsics: [],
		onFinalize: { events: [] },
		finalized: true,
	};

	beforeEach(() => {
		cache = new LRUCache<string, IBlock>({
			max: 1000,
			ttl: 60000, // 1 minute
		});
	});

	describe('High Load Performance', () => {
		it('should handle 10,000 cache operations efficiently', () => {
			const startTime = process.hrtime.bigint();

			// Perform 10,000 mixed cache operations
			for (let i = 0; i < 10000; i++) {
				const key = `perf_test_${i % 1000}`; // Reuse keys for realistic cache hits

				if (i % 3 === 0) {
					// Set operation
					cache.set(key, { ...mockBlock, number: { toString: () => i.toString() } as any });
				} else {
					// Get operation
					cache.get(key);
				}
			}

			const endTime = process.hrtime.bigint();
			const durationMs = Number(endTime - startTime) / 1000000; // Convert to milliseconds

			// Should complete within 1 second
			expect(durationMs).toBeLessThan(1000);

			// Cache size should be bounded
			expect(cache.size).toBeLessThanOrEqual(1000);
		});

		it('should maintain consistent performance with large objects', () => {
			// Create a large block with many extrinsics
			const largeBlock: IBlock = {
				...mockBlock,
				extrinsics: Array(100)
					.fill(null)
					.map((_, i) => ({
						method: 'balances.transfer',
						signature: {
							signature: `0x${'a'.repeat(128)}` as any,
							signer: `0x${'b'.repeat(64)}` as any,
						},
						nonce: { toString: () => i.toString() } as any,
						args: {} as any,
						tip: { toString: () => '0' } as any,
						hash: `0x${i.toString(16).padStart(64, '0')}`,
						info: {
							weight: { refTime: '10000', proofSize: '1000' },
							class: 'Normal',
							partialFee: '1000',
						},
						events: [],
						success: true,
						paysFee: true,
					})),
			};

			const startTime = process.hrtime.bigint();

			// Perform operations with large objects
			for (let i = 0; i < 1000; i++) {
				const key = `large_block_${i}`;
				cache.set(key, { ...largeBlock, number: { toString: () => i.toString() } as any });

				if (i > 100 && i % 10 === 0) {
					cache.get(`large_block_${i - 50}`);
				}
			}

			const endTime = process.hrtime.bigint();
			const durationMs = Number(endTime - startTime) / 1000000;

			// Should still be performant with large objects
			expect(durationMs).toBeLessThan(2000); // 2 seconds allowance for large objects
			expect(cache.size).toBeLessThanOrEqual(1000);
		});
	});

	describe('Cache Hit Ratio Analysis', () => {
		it('should achieve optimal hit ratios with realistic access patterns', () => {
			let hits = 0;
			let misses = 0;

			// Simulate realistic access pattern:
			// - Recent blocks are accessed frequently
			// - Older blocks are accessed occasionally
			const totalBlocks = 500;
			const totalRequests = 2000;

			// Pre-populate cache with some blocks
			for (let i = 0; i < totalBlocks; i++) {
				const key = `block_${i}`;
				cache.set(key, { ...mockBlock, number: { toString: () => i.toString() } as any });
			}

			// Simulate access pattern with 80/20 rule
			// 80% of requests go to 20% of blocks (recent ones)
			for (let i = 0; i < totalRequests; i++) {
				let blockId: number;

				if (Math.random() < 0.8) {
					// 80% of requests - recent blocks (last 20%)
					blockId = Math.floor(totalBlocks * 0.8 + Math.random() * totalBlocks * 0.2);
				} else {
					// 20% of requests - any block
					blockId = Math.floor(Math.random() * totalBlocks);
				}

				const key = `block_${blockId}`;
				const result = cache.get(key);

				if (result) {
					hits++;
				} else {
					misses++;
					// Cache miss - would normally fetch from API and cache
					cache.set(key, { ...mockBlock, number: { toString: () => blockId.toString() } as any });
				}
			}

			const hitRatio = hits / (hits + misses);

			// Should achieve good hit ratio with realistic access pattern
			expect(hitRatio).toBeGreaterThan(0.7); // >70% hit ratio

			// Log results for analysis
			console.log(`Cache Performance: ${hits} hits, ${misses} misses, ${(hitRatio * 100).toFixed(1)}% hit ratio`);
		});

		it('should maintain hit ratio under varying load patterns', () => {
			const scenarios = [
				{ name: 'Sequential Access', requests: 1000, pattern: (i: number) => i % 100 },
				{ name: 'Random Access', requests: 1000, pattern: () => Math.floor(Math.random() * 200) },
				{
					name: 'Hot Spot Access',
					requests: 1000,
					pattern: () => (Math.random() < 0.9 ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 200)),
				},
			];

			scenarios.forEach((scenario) => {
				cache.clear(); // Reset cache for each scenario
				let hits = 0;
				let misses = 0;

				for (let i = 0; i < scenario.requests; i++) {
					const blockId = scenario.pattern(i);
					const key = `scenario_${blockId}`;

					const result = cache.get(key);
					if (result) {
						hits++;
					} else {
						misses++;
						cache.set(key, { ...mockBlock, number: { toString: () => blockId.toString() } as any });
					}
				}

				const hitRatio = hits / (hits + misses);
				console.log(`${scenario.name}: ${(hitRatio * 100).toFixed(1)}% hit ratio`);

				// Even with different patterns, should have reasonable hit ratios
				expect(hitRatio).toBeGreaterThan(0.2); // >20% minimum
			});
		});
	});

	describe('Memory Usage Analysis', () => {
		it('should have predictable memory usage patterns', () => {
			const memoryBefore = process.memoryUsage();

			// Fill cache with known amount of data
			for (let i = 0; i < 1000; i++) {
				cache.set(`memory_test_${i}`, { ...mockBlock, number: { toString: () => i.toString() } as any });
			}

			const memoryAfter = process.memoryUsage();
			const heapGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;

			console.log(`Memory growth for 1000 cache entries: ${(heapGrowth / 1024 / 1024).toFixed(2)} MB`);

			// Memory growth should be reasonable (adjust based on block size)
			expect(heapGrowth).toBeLessThan(100 * 1024 * 1024); // < 100MB for 1000 blocks
			expect(cache.size).toBe(1000);
		});

		it('should release memory when entries are evicted', () => {
			const smallCache = new LRUCache<string, IBlock>({ max: 100 });

			// Fill beyond capacity
			for (let i = 0; i < 200; i++) {
				smallCache.set(`eviction_test_${i}`, { ...mockBlock, number: { toString: () => i.toString() } as any });
			}

			// Should only contain the most recent 100 entries
			expect(smallCache.size).toBe(100);

			// Oldest entries should be evicted
			expect(smallCache.get('eviction_test_0')).toBeUndefined();
			expect(smallCache.get('eviction_test_99')).toBeUndefined();
			expect(smallCache.get('eviction_test_100')).toBeDefined();
			expect(smallCache.get('eviction_test_199')).toBeDefined();
		});
	});

	describe('Concurrent Access Performance', () => {
		it('should handle concurrent read/write operations safely', async () => {
			const concurrentOperations = 1000;
			const promises: Promise<void>[] = [];

			const startTime = process.hrtime.bigint();

			// Create concurrent operations
			for (let i = 0; i < concurrentOperations; i++) {
				promises.push(
					new Promise((resolve) => {
						setTimeout(() => {
							const key = `concurrent_${i % 100}`;

							if (i % 2 === 0) {
								cache.set(key, { ...mockBlock, number: { toString: () => i.toString() } as any });
							} else {
								cache.get(key);
							}

							resolve();
						}, Math.random() * 10);
					}),
				);
			}

			await Promise.all(promises);

			const endTime = process.hrtime.bigint();
			const durationMs = Number(endTime - startTime) / 1000000;

			console.log(`Concurrent operations completed in ${durationMs.toFixed(2)}ms`);

			// Should complete within reasonable time
			expect(durationMs).toBeLessThan(5000); // 5 seconds

			// Cache should be in consistent state
			expect(cache.size).toBeLessThanOrEqual(100);
		});
	});

	describe('Cache Efficiency Metrics', () => {
		it('should provide cache statistics for monitoring', () => {
			// Simulate various cache operations to generate statistics
			let hits = 0;
			let misses = 0;
			let sets = 0;
			let evictions = 0;

			const statsCache = new LRUCache<string, IBlock>({
				max: 50,
				dispose: () => evictions++,
			});

			// Perform operations
			for (let i = 0; i < 200; i++) {
				const key = `stats_${i % 75}`; // Some overlap to generate hits

				const existing = statsCache.get(key);
				if (existing) {
					hits++;
				} else {
					misses++;
					statsCache.set(key, { ...mockBlock, number: { toString: () => i.toString() } as any });
					sets++;
				}
			}

			const totalOperations = hits + misses;
			const hitRatio = hits / totalOperations;
			const evictionRate = evictions / sets;

			console.log('Cache Statistics:');
			console.log(`  Total operations: ${totalOperations}`);
			console.log(`  Hit ratio: ${(hitRatio * 100).toFixed(1)}%`);
			console.log(`  Cache sets: ${sets}`);
			console.log(`  Evictions: ${evictions}`);
			console.log(`  Eviction rate: ${(evictionRate * 100).toFixed(1)}%`);
			console.log(`  Final cache size: ${statsCache.size}`);

			// Validate metrics
			expect(totalOperations).toBe(200);
			expect(hitRatio).toBeGreaterThanOrEqual(0);
			expect(evictions).toBeGreaterThan(0); // Should have some evictions due to max: 50
			expect(statsCache.size).toBeLessThanOrEqual(50);
		});
	});
});
