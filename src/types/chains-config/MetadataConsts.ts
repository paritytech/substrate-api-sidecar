export interface MetadataConstDefinition extends MetadataWeightDefinition {
	/**
	 * Runtimes that include their specific definition of extrinsicBaseWeight
	 */
	runtimeVersions: number[];
}

export interface MetadataWeightDefinition {
	/**
	 * Polkadot runtime versions before v0.8.27
	 * Kusama runtime versions before v2027
	 */
	extrinsicBaseWeight?: number;
	/**
	 * Polkadot runtime versions after v0.8.26
	 * Kusama runtime versions after v2026
	 */
	blockWeights?: BlockWeightDefinitions;
}

interface PerClassTypes {
	baseExtrinsic: number;
}

interface BlockWeightDefinitions {
	perClass: Record<string, PerClassTypes>;
}
