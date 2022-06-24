import BN from 'bn.js';

import { subIntegers } from './compare';

describe('Compare integers', () => {
	describe('subIntegers', () => {
		const foo = new BN(100);
		const bar = new BN(101);

		expect(subIntegers(foo, bar)).toBe(1);
		expect(subIntegers(bar, foo)).toBe(1);
	});
});
