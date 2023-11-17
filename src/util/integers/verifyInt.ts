/**
 * Verify all integers including zeroes.
 * @param num
 */
export const verifyUInt = (num: number): boolean => {
	return Number.isInteger(num) && num >= 0;
};

/**
 * Verify all integers except for zero. Will return false when zero is inputted.
 * @param num
 */
export const verifyNonZeroUInt = (num: number): boolean => {
	return Number.isInteger(num) && num > 0;
};
