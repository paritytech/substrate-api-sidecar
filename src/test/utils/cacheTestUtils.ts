// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.

import { LRUCache } from 'lru-cache';

import { IBlock } from '../../types/responses';

/**
 * Test utilities for cache testing scenarios
 */
export class CacheTestUtils {
	/**
	 * Creates a mock block with realistic structure
	 */
	static createMockBlock(blockNumber: number, hash?: string): IBlock {
		const blockHash = hash || `0x${blockNumber.toString(16).padStart(64, '0')}`;

		return {
			number: { toString: () => blockNumber.toString() } as any,
			hash: blockHash as any,
			parentHash: `0x${(blockNumber - 1).toString(16).padStart(64, '0')}` as any,
			stateRoot: `0x${'1'.repeat(64)}` as any,
			extrinsicsRoot: `0x${'2'.repeat(64)}` as any,
			authorId: undefined,
			logs: [],
			onInitialize: { events: [] },
			extrinsics: this.createMockExtrinsics((blockNumber % 5) + 1), // Variable number of extrinsics
			onFinalize: { events: [] },
			finalized: true,
		};
	}

	/**
	 * Creates mock extrinsics for a block
	 */
	private static createMockExtrinsics(count: number) {
		return Array(count)
			.fill(null)
			.map((_, i) => ({
				method: i === 0 ? 'timestamp.set' : 'balances.transfer',
				signature:
					i === 0
						? null
						: {
								signature: `0x${'a'.repeat(128)}` as any,
								signer: `0x${'b'.repeat(64)}` as any,
							},
				nonce: i === 0 ? null : ({ toString: () => i.toString() } as any),
				args: {} as any,
				tip: i === 0 ? null : ({ toString: () => '0' } as any),
				hash: `0x${i.toString(16).padStart(64, '0')}`,
				info: {
					weight: { refTime: '10000', proofSize: '1000' },
					class: i === 0 ? 'Mandatory' : 'Normal',
					partialFee: i === 0 ? null : '1000',
				},
				events: [],
				success: true,
				paysFee: i !== 0,
			}));
	}

	/**
	 * Generates cache keys for different parameter combinations
	 */
	static generateCacheKey(
		blockHash: string,
		options: {
			eventDocs?: boolean;
			extrinsicDocs?: boolean;
			checkFinalized?: boolean;
			noFees?: boolean;
			checkDecodedXcm?: boolean;
			paraId?: number;
			useEvmAddressFormat?: boolean;
		} = {},
	): string {
		return (
			blockHash +
			Number(!!options.eventDocs) +
			Number(!!options.extrinsicDocs) +
			Number(!!options.checkFinalized) +
			Number(!!options.noFees) +
			Number(!!options.checkDecodedXcm) +
			Number(options.paraId || 0) +
			Number(!!options.useEvmAddressFormat)
		);
	}

	/**
	 * Fills a cache with test data
	 */
	static fillCache(cache: LRUCache<string, IBlock>, count: number, keyPrefix: string = 'block_'): string[] {
		const keys: string[] = [];

		for (let i = 0; i < count; i++) {
			const key = `${keyPrefix}${i}`;
			const block = this.createMockBlock(i);
			keys.push(key);
			cache.set(key, block);
		}

		return keys;
	}

	/**
	 * Simulates realistic access patterns (80/20 rule)
	 */
	static simulateRealisticAccess(
		cache: LRUCache<string, IBlock>,
		requests: number,
		totalBlocks: number,
	): { hits: number; misses: number; hitRatio: number } {
		let hits = 0;
		let misses = 0;

		// Pre-populate cache with some blocks
		for (let i = 0; i < Math.min(totalBlocks, cache.max); i++) {
			const key = `realistic_block_${i}`;
			cache.set(key, this.createMockBlock(i));
		}

		// Simulate access pattern with 80/20 rule
		for (let i = 0; i < requests; i++) {
			let blockId: number;

			if (Math.random() < 0.8) {
				// 80% of requests - recent blocks (last 20%)
				blockId = Math.floor(totalBlocks * 0.8 + Math.random() * totalBlocks * 0.2);
			} else {
				// 20% of requests - any block
				blockId = Math.floor(Math.random() * totalBlocks);
			}

			const key = `realistic_block_${blockId}`;
			const result = cache.get(key);

			if (result) {
				hits++;
			} else {
				misses++;
				// Cache miss - simulate fetching and caching
				cache.set(key, this.createMockBlock(blockId));
			}
		}

		return {
			hits,
			misses,
			hitRatio: hits / (hits + misses),
		};
	}

	/**
	 * Measures memory usage of cache operations
	 */
	static measureMemoryUsage<T>(operation: () => T): { result: T; memoryDelta: number } {
		// Force garbage collection if available (in test env with --expose-gc)
		if (global.gc) {
			global.gc();
		}

		const before = process.memoryUsage();
		const result = operation();
		const after = process.memoryUsage();

		return {
			result,
			memoryDelta: after.heapUsed - before.heapUsed,
		};
	}

	/**
	 * Creates concurrent cache operations for testing
	 */
	static createConcurrentOperations(
		cache: LRUCache<string, IBlock>,
		operationCount: number,
		keySpace: number = 100,
	): Promise<void>[] {
		const promises: Promise<void>[] = [];

		for (let i = 0; i < operationCount; i++) {
			promises.push(
				new Promise((resolve) => {
					setTimeout(() => {
						const key = `concurrent_${i % keySpace}`;

						if (i % 2 === 0) {
							// Set operation
							cache.set(key, this.createMockBlock(i));
						} else {
							// Get operation
							cache.get(key);
						}

						resolve();
					}, Math.random() * 10);
				}),
			);
		}

		return promises;
	}

	/**
	 * Validates cache consistency after operations
	 */
	static validateCacheConsistency<K extends {}, V extends {}>(
		cache: LRUCache<K, V>,
		expectedMaxSize?: number,
	): { isConsistent: true } | { isConsistent: false; errors: string[] } {
		const errors: string[] = [];

		// Check size bounds
		if (expectedMaxSize && cache.size > expectedMaxSize) {
			errors.push(`Cache size ${cache.size} exceeds expected maximum ${expectedMaxSize}`);
		}

		// Check that size matches actual entries
		const actualSize = Array.from(cache.keys()).length;
		if (cache.size !== actualSize) {
			errors.push(`Cache.size (${cache.size}) doesn't match actual entries (${actualSize})`);
		}

		// Check that all keys have corresponding values
		for (const key of cache.keys()) {
			if (!cache.has(key)) {
				errors.push(`Key ${key} exists in keys() but has() returns false`);
			}
		}

		return errors.length === 0 ? { isConsistent: true } : { isConsistent: false, errors };
	}

	/**
	 * Creates test scenarios with different access patterns
	 */
	static createAccessPatternScenarios(): Array<{
		name: string;
		requests: number;
		pattern: (i: number) => number;
		expectedMinHitRatio: number;
	}> {
		return [
			{
				name: 'Sequential Access',
				requests: 1000,
				pattern: (i: number) => i % 100,
				expectedMinHitRatio: 0.9, // High hit ratio for sequential
			},
			{
				name: 'Random Access',
				requests: 1000,
				pattern: () => Math.floor(Math.random() * 200),
				expectedMinHitRatio: 0.2, // Lower hit ratio for random
			},
			{
				name: 'Hot Spot Access',
				requests: 1000,
				pattern: () =>
					Math.random() < 0.9
						? Math.floor(Math.random() * 10) // 90% access to 10 items
						: Math.floor(Math.random() * 200), // 10% access to broader range
				expectedMinHitRatio: 0.8, // High hit ratio due to hot spots
			},
			{
				name: 'Burst Access',
				requests: 500,
				pattern: (i: number) => {
					const burstSize = 50;
					const burstIndex = Math.floor(i / burstSize);
					return burstIndex * 10 + (i % burstSize);
				},
				expectedMinHitRatio: 0.6, // Moderate hit ratio
			},
		];
	}

	/**
	 * Benchmarks cache performance
	 */
	static benchmark(
		name: string,
		operation: () => void,
		iterations: number = 1000,
	): { name: string; avgTimeMs: number; totalTimeMs: number } {
		const startTime = process.hrtime.bigint();

		for (let i = 0; i < iterations; i++) {
			operation();
		}

		const endTime = process.hrtime.bigint();
		const totalTimeMs = Number(endTime - startTime) / 1000000;

		return {
			name,
			avgTimeMs: totalTimeMs / iterations,
			totalTimeMs,
		};
	}
}
