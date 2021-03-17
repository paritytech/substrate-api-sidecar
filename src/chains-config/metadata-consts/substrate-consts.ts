/**
 * All Runtimes before v27
 */
export const extrinsicBaseWeight: number = 125000000;

/**
 * Runtimes after v26
 */
export const blockWeights = {
	baseBlock: 5000000000,
	maxBlock: 2000000000000,
	perClass: {
		normal: {
			baseExtrinsic: 125000000,
			maxExtrinsic: 371168000000001,
			maxTotal: null,
			reserved: 1500000000000,
		},
		operational: {
			baseExtrinsic: 1,
			maxExtrinsic: 32000000000,
			maxTotal: null,
			reserved: 1949875000000,
		},
		mandatory: {
			baseExtrinsic: 512000000000001,
			maxExtrinsic: '0x00746a5288000100',
			maxTotal: null,
			reserved: null,
		},
	},
};
