/**
 * WEIGHT NOTES (POLKADOT | KUSAMA)
 * @constant extrinsicBaseWeight
 * @constant blockWeights
 *
 * The following weights are used for Polkadot and Kusama chains. Both are using
 * the same fee calculations currently, and share the same Integer values. Because
 * of this we are allowing them both to share the same set of variables in order
 * to keep things as DRY as possible. That being said, if Kusama or Polkadot ever
 * change their definitions for weight calculation those definitions can be added
 * directly to `./polkadotConsts`, and `./kusamaConsts` files.
 */

/**
 * Polkadot runtime versions before v0.8.27
 * Kusama runtime versions before v2027
 */

// REVIEW NOTE
// I don't see the purpose of this type cast and if anything its just dangerous.
// If we need an AbstractInt make an AbstractInt. If you need a BN make a BN.
// Otherwise a typecase like this should only be done when we are certain of the
// and just need to tell the compiler. Remeber `as` and typescript expressioins
// in general only operate at compile time - they are irrelevant at runtime, so
// all this statement does is smash some downstream compile time warnings about
// trying to treat a number like an AbastractInt.
// export const extrinsicBaseWeight = (125000000 as unknown) as AbstractInt;
export const extrinsicBaseWeight = BigInt(125000000);

/**
 * Polkadot runtime versions after v0.8.26
 * Kusama runtime versions after v2026
 */
export const perClass = {
	normal: {
		// REVIEW NOTE, these should be stored as the value needed when they are used. No sense
		// in having to just do the conversion later on N times when we could just start out with
		// the needed value.
		baseExtrinsic: BigInt(125000000),
	},
	operational: {
		baseExtrinsic: BigInt(1),
	},
	mandatory: {
		baseExtrinsic: BigInt(512000000000001),
	},
};
