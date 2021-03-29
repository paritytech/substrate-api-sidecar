/**
 * WEIGHT NOTES (POLKADOT | KUSAMA)
 *
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

import { IPerClass } from 'src/types/chains-config';

/**
 * Polkadot runtime versions before v27
 * Kusama runtime versions before v2027
 */
export const extrinsicBaseWeight = BigInt(125000000);

/**
 * Polkadot runtime versions after v26
 * Kusama runtime versions after v2026
 */
export const perClass: IPerClass = {
	normal: {
		baseExtrinsic: BigInt(125000000),
	},
	operational: {
		baseExtrinsic: BigInt(1),
	},
	mandatory: {
		baseExtrinsic: BigInt(512000000000001),
	},
};
