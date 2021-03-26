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

/**
 * Cache for specific runtime version metadata constants.
 */
export type MetaConstsCache = Record<number, MetaWeightDefVal>;

// REVIEW NOTE
// I think organizing this type as a union will give better errors from tsc.
// Additionally, I preffer having it as minimally nested for now for simplicity.
export type MetaWeightDefVal = ExtBaseWeightEntry | PerClassEntry;

/**
 * Polkadot runtime versions before v27
 * Kusama runtime versions before v2027
 */
export interface ExtBaseWeightEntry {
	extrinsicBaseWeight?: BigInt;
}

/**
 * Polkadot runtime versions after v26
 * Kusama runtime versions after v2026
 */
export interface PerClassEntry {
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

export type BlockWeightStore = Record<number, MetaWeightDefVal>;
