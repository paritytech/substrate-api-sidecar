import BN from 'bn.js';

import { subIntegers } from './compare';

describe('Compare integers', () => {
	describe('subIntegers', () => {
		it('Should return the correct value for any ordered input', () => {
			const foo = new BN(100);
			const bar = new BN(101);

			expect(subIntegers(foo, bar).toString()).toBe('1');
			expect(subIntegers(bar, foo).toString()).toBe('1');
		});
	});
});
