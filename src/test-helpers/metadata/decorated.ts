import { expandMetadata } from '@polkadot/metadata/decorate';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import {
	polkadotRegistry,
	polkadotV27Registry,
} from '../registries/polkadotRegistry';
import {
	kusamaMetadata,
	polkadotMetadata,
	polkadotV27Metadata,
} from './metadata';

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

/**
 * Decorated metadata of the polkadotRegistry (v27).
 */
export const decoratedPolkadotV27Metadata = expandMetadata(
	polkadotV27Registry,
	polkadotV27Metadata
);
