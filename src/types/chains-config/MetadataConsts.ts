export interface MetadataConstDefinition {
	/**
	 * Runtimes that include their specific definition of extrinsicBaseWeight
	 */
	runtimeVersions: number[];
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
}

interface BlockWeightDefinitions {
	perClass: Record<string, PerClassTypes>;
}
