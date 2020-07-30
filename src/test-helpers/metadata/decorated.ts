import Decorated from '@polkadot/metadata/Decorated';
import substrateMetadataRpc from '@polkadot/metadata/Metadata/v11/static';
import { Metadata } from '@polkadot/types';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import { polkadotRegistry } from '../registries/polkadotRegistry';
import { polkadotV16MetadataRpc } from './polkadotV16Metadata';

/**
 * Decorated metadata of the kusamaRegistry (v2008).
 */
export const decoratedKusamaMetadata = new Decorated(
	kusamaRegistry,
	new Metadata(kusamaRegistry, substrateMetadataRpc)
);

/**
 * Decorated metadata of the polkadotRegistry (v16).
 */
export const decoratedPolkadotMetadata = new Decorated(
	polkadotRegistry,
	new Metadata(polkadotRegistry, polkadotV16MetadataRpc)
);
