/**
 * WEIGHT NOTES (STATEMINE | STATEMINT)
 *
 * The following weights are used for common good parachains such as statemine, and
 * statemint. Both are using the same fee calculation currently and share the same
 * integer values.
 *
 */

import { IPerClass } from 'src/types/chains-config';

export const perClassCommonParachains: IPerClass = {
	normal: {
		baseExtrinsic: BigInt(125000000),
	},
	operational: {
		baseExtrinsic: BigInt(125000000),
	},
	mandatory: {
		baseExtrinsic: BigInt(125000000),
	},
};
