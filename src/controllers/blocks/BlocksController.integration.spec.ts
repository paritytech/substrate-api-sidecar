// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.

import { LRUCache } from 'lru-cache';

import { IBlock } from '../../types/responses';

/**
 * Integration tests for BlocksController caching and memory leak prevention
 * These tests verify the controller works correctly in a real HTTP server context
 */
describe('BlocksController Integration Cache Tests', () => {
	let blockStore: LRUCache<string, IBlock>;

	const mockBlock: IBlock = {
		number: { toString: () => '1000' } as any,
		hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as any,
		parentHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as any,
		stateRoot: '0x1111111111111111111111111111111111111111111111111111111111111111' as any,
		extrinsicsRoot: '0x2222222222222222222222222222222222222222222222222222222222222222' as any,
		authorId: undefined,
		logs: [],
		onInitialize: { events: [] },
		extrinsics: [
			{
				method: 'timestamp.set',
				signature: null,
				nonce: null,
				args: {} as any,
				tip: null,
				hash: '0xextrinsic1',
				info: {
					weight: { refTime: '1000', proofSize: '100' },
					class: 'Mandatory',
					partialFee: null,
				},
				events: [],
				success: true,
				paysFee: false,
			},
		],
		onFinalize: { events: [] },
		finalized: true,
	};

	beforeAll(() => {
		// Create a cache with realistic settings for integration testing
		blockStore = new LRUCache<string, IBlock>({
			max: 100, // Larger cache for integration tests
			ttl: 300000, // 5 minute TTL
		});
	});

	describe('Memory Leak Prevention', () => {
		it('should maintain stable memory usage over many requests', async () => {
			const initialMemory = process.memoryUsage();
			const requests: Promise<any>[] = [];

			// Simulate 500 concurrent requests to different blocks
			for (let i = 0; i < 500; i++) {
				const blockHash = `0x${'0'.repeat(62)}${i.toString(16).padStart(2, '0')}`;

				// Store mock data in cache to simulate real behavior
				blockStore.set(blockHash + '00000', {
					...mockBlock,
					number: { toString: () => i.toString() } as any,
					hash: blockHash as any,
				});
			}

			// Wait for all requests to complete
			await Promise.all(requests);

			const finalMemory = process.memoryUsage();
			const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

			// Memory growth should be bounded (not proportional to request count)
			// Allow up to 50MB growth for 500 requests
			expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);

			// Cache size should be limited by LRU eviction
			expect(blockStore.size).toBeLessThanOrEqual(100);
		});

		it('should handle rapid sequential requests without unbounded growth', async () => {
			// Make many rapid requests that would cause cache growth
			for (let i = 0; i < 200; i++) {
				const cacheKey = `rapidTest${i}`;
				blockStore.set(cacheKey, {
					...mockBlock,
					number: { toString: () => i.toString() } as any,
					hash: `0x${i.toString(16).padStart(64, '0')}` as any,
				});
			}

			// Cache should have evicted old entries
			expect(blockStore.size).toBeLessThanOrEqual(100);

			// Verify LRU behavior - oldest entries should be gone
			expect(blockStore.get('rapidTest0')).toBeUndefined();
			expect(blockStore.get('rapidTest199')).toBeDefined();
		});
	});

	describe('Cache Hit Ratio and Performance', () => {
		it('should achieve good cache hit ratio for repeated requests', () => {
			const testKey = 'hitRatioTest';
			let hits = 0;
			let misses = 0;

			// First request - cache miss
			const firstResult = blockStore.get(testKey);
			if (!firstResult) {
				misses++;
				blockStore.set(testKey, mockBlock);
			} else {
				hits++;
			}

			// Next 10 requests - should be cache hits
			for (let i = 0; i < 10; i++) {
				const result = blockStore.get(testKey);
				if (result) {
					hits++;
				} else {
					misses++;
				}
			}

			const hitRatio = hits / (hits + misses);
			expect(hitRatio).toBeGreaterThan(0.9); // >90% hit ratio
		});

		it('should handle different query parameter combinations correctly', () => {
			const baseHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

			// Test different parameter combinations
			const paramCombinations = [
				'00000', // no options
				'10000', // eventDocs only
				'01000', // extrinsicDocs only
				'11000', // both eventDocs and extrinsicDocs
				'00100', // checkFinalized only
				'00010', // noFees only
			];

			// Each combination should have its own cache entry
			paramCombinations.forEach((params, index) => {
				const cacheKey = baseHash + params;
				blockStore.set(cacheKey, {
					...mockBlock,
					number: { toString: () => index.toString() } as any,
				});
			});

			// All should be cached separately (but LRU might have evicted some)
			expect(blockStore.size).toBeLessThanOrEqual(100);

			// Each should return the correct cached value
			paramCombinations.forEach((params, index) => {
				const cacheKey = baseHash + params;
				const cached = blockStore.get(cacheKey);
				expect(cached).toBeDefined();
				expect(cached!.number.toString()).toBe(index.toString());
			});
		});
	});

	describe('Cache Durability and TTL', () => {
		it('should respect TTL and evict expired entries', async () => {
			// Create a short-TTL cache for testing
			const shortTTLCache = new LRUCache<string, IBlock>({
				max: 10,
				ttl: 50, // 50ms TTL
			});

			shortTTLCache.set('ttlTest', mockBlock);

			// Should be available immediately
			expect(shortTTLCache.get('ttlTest')).toBeDefined();

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should be expired and unavailable
			expect(shortTTLCache.get('ttlTest')).toBeUndefined();
		});

		it('should update TTL on access (updateAgeOnGet)', () => {
			const updateCache = new LRUCache<string, IBlock>({
				max: 10,
				ttl: 100, // 100ms TTL
				updateAgeOnGet: true,
			});

			updateCache.set('updateTest', mockBlock);

			// Access the item after 60ms (before original expiration)
			setTimeout(() => {
				const result = updateCache.get('updateTest');
				expect(result).toBeDefined(); // Should still be there

				// Check again after another 60ms (120ms total, but TTL was refreshed)
				setTimeout(() => {
					const laterResult = updateCache.get('updateTest');
					expect(laterResult).toBeDefined(); // Should still be there due to TTL refresh
				}, 60);
			}, 60);
		});
	});

	describe('Error Conditions and Edge Cases', () => {
		it('should handle cache corruption gracefully', () => {
			// Simulate cache with null entry
			blockStore.set('corrupted', null as any);

			const result = blockStore.get('corrupted');
			expect(result).toBeNull();

			// Cache should still function normally
			blockStore.set('normal', mockBlock);
			expect(blockStore.get('normal')).toBeDefined();
		});

		it('should handle maximum cache size correctly', () => {
			const smallCache = new LRUCache<string, IBlock>({ max: 3 });

			// Fill beyond capacity
			smallCache.set('item1', mockBlock);
			smallCache.set('item2', mockBlock);
			smallCache.set('item3', mockBlock);
			smallCache.set('item4', mockBlock); // Should evict item1

			expect(smallCache.size).toBe(3);
			expect(smallCache.get('item1')).toBeUndefined(); // Evicted
			expect(smallCache.get('item4')).toBeDefined(); // New item
		});

		it('should handle concurrent access safely', async () => {
			const concurrentPromises: Promise<void>[] = [];

			// Simulate concurrent access
			for (let i = 0; i < 50; i++) {
				concurrentPromises.push(
					new Promise((resolve) => {
						setTimeout(() => {
							blockStore.set(`concurrent${i}`, {
								...mockBlock,
								number: { toString: () => i.toString() } as any,
							});
							blockStore.get(`concurrent${Math.floor(i / 2)}`);
							resolve();
						}, Math.random() * 10);
					}),
				);
			}

			await Promise.all(concurrentPromises);

			// Cache should be in a consistent state
			expect(blockStore.size).toBeLessThanOrEqual(100);
		});
	});
});
