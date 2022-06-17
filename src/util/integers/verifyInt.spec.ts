import { verifyNonZeroUInt, verifyUInt } from './verifyInt';

describe('Verify integers', () => {
	describe('verifyUInt', () => {
		it('Should correctly handle unsigned integers correctly', () => {
			expect(verifyUInt(0)).toBe(true);
			expect(verifyUInt(1)).toBe(true);
			expect(verifyUInt(-1)).toBe(false);
		});
	});

	describe('verifyNonZeroUInt', () => {
		it('Should correctly handle unsigned integers correctly', () => {
			expect(verifyNonZeroUInt(1)).toBe(true);
			expect(verifyNonZeroUInt(0)).toBe(false);
			expect(verifyNonZeroUInt(-1)).toBe(false);
		});
	});
});
