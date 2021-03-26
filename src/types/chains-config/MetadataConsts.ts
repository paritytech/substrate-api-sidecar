import { WeightPerClass } from '@polkadot/types/interfaces';

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
	extrinsicBaseWeight?: BigInt;
	/**
	 * Polkadot runtime versions after v0.8.26
	 * Kusama runtime versions after v2026
	 */
	blockWeights?: PerClassEntry;
}

/**
 * Cache for specific runtime version metadata constants.
 */
export type MetaConstsCache = Record<number, MetaWeightDefVal>;

// REVIEW NOTE
// I think organizing this type as a union will give better errors from tsc.
// Additionally, I preffer having it as minimally nested for now for simplicity.
export type MetaWeightDefVal = ExtBaseWeightEntry | PerClassEntry;

/**
 * Polkadot runtime versions before v0.8.27
 * Kusama runtime versions before v2027
 */
export interface ExtBaseWeightEntry {
	extrinsicBaseWeight?: BigInt;
}

/**
 * Polkadot runtime versions after v0.8.26
 * Kusama runtime versions after v2026
 */
export interface PerClassEntry {
	perClass: PerClassEntry;
}

export interface PerClass {
	normal: WeightPerClass;
	mandatory: WeightPerClass;
	operational: WeightPerClass;
}
