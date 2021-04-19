export type MetadataConsts =
	| (PerClassValue & RuntimeVersions)
	| (ExtBaseWeightValue & RuntimeVersions);

interface RuntimeVersions {
	/**
	 * Runtimes that include their specific definition of extrinsicBaseWeight
	 */
	runtimeVersions: number[];
}

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

export function isExtBaseWeightValue(
	thing: unknown
): thing is ExtBaseWeightValue {
	return typeof (thing as ExtBaseWeightValue)?.extrinsicBaseWeight === 'bigint';
}

/**
 * Polkadot runtime versions after v26
 * Kusama runtime versions after v2026
 *
 * Block weight store value type for blockweights.perClass.
 */
export interface PerClassValue {
	perClass: IPerClass;
}

export function isPerClassValue(thing: unknown): thing is PerClassValue {
	return (
		typeof (thing as PerClassValue)?.perClass?.normal.baseExtrinsic ===
			'bigint' &&
		typeof (thing as PerClassValue)?.perClass?.operational.baseExtrinsic ===
			'bigint' &&
		typeof (thing as PerClassValue)?.perClass?.mandatory.baseExtrinsic ===
			'bigint'
	);
}

export interface IPerClass {
	normal: IWeightPerClass;
	mandatory: IWeightPerClass;
	operational: IWeightPerClass;
}

export interface IWeightPerClass {
	baseExtrinsic: BigInt;
}

export type BlockWeightStore = Record<number, WeightValue>;
