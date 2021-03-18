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
	 * Depends on if the runtime >= v27 or runtime < v27
	 */
	extrinsicBaseWeight: BlockWeightDefinitions | number;
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

interface PerClassDefinitions {
	normal: PerClassTypes;
	operational: PerClassTypes;
	mandatory: PerClassTypes;
}

interface BlockWeightDefinitions {
	baseBlock: number;
	maxBlock: number;
	perClass: PerClassDefinitions;
}
