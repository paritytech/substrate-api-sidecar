export interface Definition {
	/**
	 * Runtimes that include their specific definition of extrinsicBaseWeight
	 */
	runtimes: number[];
	/**
	 * The type of specName associated with this Definition
	 */
	chain: string;
	/**
	 * Runtime < v27
	 */
	extrinsicBaseWeight?: number;
	/**
	 * Runtime >= 27
	 */
	blockWeights?: BlockWeightDefinitions;
}

interface PerClassTypes {
	baseExtrinsic: number;
	/**
	 * Can be represented as a number or hex value
	 */
	maxExtrinsic: number | string;
	maxTotal: number | null;
	reserved: number | null;
}

interface BlockWeightDefinitions {
	baseBlock: number;
	maxBlock: number;
	perClass: Record<string, PerClassTypes>;
}
