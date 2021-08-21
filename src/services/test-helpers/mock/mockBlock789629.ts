import { polkadotRegistry } from '../../../test-helpers/registries';
import block789629 from './data/block789629.json';
import block789629Fork from './data/blocks789629Fork.json';

/**
 * Mock for polkadot block #789629.
 */
export const mockBlock789629 = polkadotRegistry.createType(
	'Block',
	block789629
);

/**
 * BlockHash for polkadot block #789629.
 */
export const blockHash789629 = polkadotRegistry.createType(
	'BlockHash',
	'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578'
);

/**
 * Mock for polkadot forked block #789629.
 */
export const mockForkedBlock789629 = polkadotRegistry.createType(
	'Block',
	block789629Fork
);
