import { polkadotRegistry } from '../../../test-helpers/registries';

/**
 * BlockHash for polkadot block #20000
 */
export const blockHash20000 = polkadotRegistry.createType(
	'BlockHash',
	'0x1c309003c5737bb473fa04dc3cce638122d5ffd64497e024835bce71587c4d46'
);

/** BlockHash for polkadot block #1000000 */
export const blockHash100000 = polkadotRegistry.createType(
	'BlockHash',
	'0x490cd542b4a40ad743183c7d1088a4fe7b1edf21e50c850b86f29e389f31c5c1'
);
