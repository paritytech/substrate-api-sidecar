import { expandMetadata } from '@polkadot/metadata/decorate';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import { polkadotRegistry } from '../registries/polkadotRegistry';
import { kusamaMetadata, polkadotMetadata } from './metadata';

/**
 * Decorated metadata of the kusamaRegistry (v2008).
 */
export const decoratedKusamaMetadata = expandMetadata(
	kusamaRegistry,
	kusamaMetadata
);

/**
 * Decorated metadata of the polkadotRegistry (v16).
 */
export const decoratedPolkadotMetadata = expandMetadata(
	polkadotRegistry,
	polkadotMetadata
);
