export interface MetadataConsts {
	/**
	 * Runtimes that include their specific definition of extrinsicBaseWeight
	 */
	runtimeVersions: number[];
	/**
	 * Polkadot runtime versions before v27
	 * Kusama runtime versions before v2027
	 */
	extrinsicBaseWeight?: BigInt;
	/**
	 * Polkadot runtime versions after v26
	 * Kusama runtime versions after v2026
	 */
	perClass?: IPerClass;
}

// REVIEW NOTE
// I think organizing this type as a union will give better errors from tsc.
// Additionally, I preffer having it as minimally nested for now for simplicity.
/**
 * Block weight store value types.
 */
export type WeightValue = ExtBaseWeightValue | PerClassValue;

/**
 * Polkadot runtime versions before v27
 * Kusama runtime versions before v2027
 *
 * Block weight store value type for extrinsicBaseWeight.
 */
export interface ExtBaseWeightValue {
	extrinsicBaseWeight?: BigInt;
}

/**
 * Polkadot runtime versions after v26
 * Kusama runtime versions after v2026
 *
 * Block weight store value type for perClass.
 */
export interface PerClassValue {
	perClass: IPerClass;
}

export interface IPerClass {
	normal: IWeightPerClass;
	mandatory: IWeightPerClass;
	operational: IWeightPerClass;
}

// REVIEW NOTE narrower types are generally more helpful
export interface IWeightPerClass {
	baseExtrinsic: BigInt;
}

export type BlockWeightStore = Record<number, WeightValue>;
