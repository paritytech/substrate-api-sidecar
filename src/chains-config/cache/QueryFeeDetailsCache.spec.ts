import { QueryFeeDetailsCache } from '.';

describe('QueryFeeDetails', () => {
	let cache: QueryFeeDetailsCache;
	beforeAll(() => {
		// All tests below are based off of these 2 values ie (20, 25);
		cache = new QueryFeeDetailsCache(20, 25);
	});

	it('Should return the correct QueryFee enum value', () => {
		// For values in between `versionWithCall` and `versionWithoutCall`
		const unknownRes = cache.isQueryFeeDetailsAvail(21);
		expect(unknownRes).toBe('unknown');

		const availableRes = cache.isQueryFeeDetailsAvail(26);
		const availableEqRes = cache.isQueryFeeDetailsAvail(25);
		expect(availableRes).toBe('available');
		expect(availableEqRes).toBe('available');

		const notAvailableRes = cache.isQueryFeeDetailsAvail(19);
		const notAvailableEqRes = cache.isQueryFeeDetailsAvail(20);
		expect(notAvailableRes).toBe('notAvailable');
		expect(notAvailableEqRes).toBe('notAvailable');
	});

	it('Should correctly `setVersionWithoutCall`', () => {
		// Ensure it doesn't change the _versionWithoutCall when its less than the current
		cache.setVersionWithoutCall(10);
		expect(cache['_versionWithoutCall']).toBe(20);

		cache.setVersionWithoutCall(22);
		expect(cache['_versionWithoutCall']).toBe(22);
	});

	it('Should correctly `setVersionWithCall`', () => {
		// Ensure it doesn't change the _versionWithCall when its greater than the current
		cache.setVersionWithCall(30);
		expect(cache['_versionWithCall']).toBe(25);

		cache.setVersionWithCall(24);
		expect(cache['_versionWithCall']).toBe(24);
	});

	it('Should handle null and 0 values correctly', () => {
		const nullCache = new QueryFeeDetailsCache(null, null);

		// Check if it handles 0 values correctly against the null check
		nullCache.setVersionWithoutCall(0);
		expect(nullCache['_versionWithoutCall']).toBe(0);

		// Check if it handles 0 values correctly against the null check
		nullCache.setVersionWithCall(0);
		expect(nullCache['_versionWithCall']).toBe(0);
	});
});
