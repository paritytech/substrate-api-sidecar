import BN from 'bn.js';

/**
 * Compare the difference between two values. Ensures that we substract by the largest value.
 */
export const subIntegers = (a: BN, b: BN): BN => {
	return a.gt(b) ? a.sub(b) : b.sub(a);
};
