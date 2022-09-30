import { QueryFeeDetailsCache } from '.';

describe('QueryFeeDetails', () => {
	let cache: QueryFeeDetailsCache;
	beforeAll(() => {
		// All tests below are based off of these 2 values ie (20, 25);
		cache = new QueryFeeDetailsCache(20, 25);
	});

	it('Should return the correct QueryFee enum value', () => {
		// For values in between `registerWithCall` and `registerWithoutCall`
		const unknownRes = cache.hasQueryFeeDetails(21);
		expect(unknownRes).toBe('unknown');

		const availableRes = cache.hasQueryFeeDetails(26);
		const availableEqRes = cache.hasQueryFeeDetails(25);
		expect(availableRes).toBe('available');
		expect(availableEqRes).toBe('available');

		const notAvailableRes = cache.hasQueryFeeDetails(19);
		const notAvailableEqRes = cache.hasQueryFeeDetails(20);
		expect(notAvailableRes).toBe('notAvailable');
		expect(notAvailableEqRes).toBe('notAvailable');
	});

	it('Should correctly `setRegisterWithoutCall`', () => {
		// Ensure it doesn't change the _registerWithoutCall when its less than the current
		cache.setRegisterWithoutCall(10);
		expect(cache['_registerWithoutCall']).toBe(20);

		cache.setRegisterWithoutCall(22);
		expect(cache['_registerWithoutCall']).toBe(22);
	});

	it('Should correctly `setRegisterWithCall`', () => {
		// Ensure it doesn't change the _registerWithCall when its greater than the current
		cache.setRegisterWithCall(30);
		expect(cache['_registerWithCall']).toBe(25);

		cache.setRegisterWithCall(24);
		expect(cache['_registerWithCall']).toBe(24);
	});

	it('Should handle null and 0 values correctly', () => {
		const nullCache = new QueryFeeDetailsCache(null, null);

		// Check if it handles 0 values correctly against the null check
		nullCache.setRegisterWithoutCall(0);
		expect(nullCache['_registerWithoutCall']).toBe(0);

		// Check if it handles 0 values correctly against the null check
		nullCache.setRegisterWithCall(0);
		expect(nullCache['_registerWithCall']).toBe(0);
	});
});
