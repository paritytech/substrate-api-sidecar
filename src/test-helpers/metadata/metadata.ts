import substrateMetadataRpc from '@polkadot/metadata/v11/static';
import { Metadata } from '@polkadot/types';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import { polkadotRegistry } from '../registries/polkadotRegistry';
import { polkadotV16MetadataRpc } from './polkadotV16Metadata';

/**
 * Metadata of the polkadotRegistry (v16).
 */
export const polkadotMetadata = new Metadata(
	polkadotRegistry,
	polkadotV16MetadataRpc
);

/**
 * Metadata of the kusamaRegistry (v2008).
 */
export const kusamaMetadata = new Metadata(
	kusamaRegistry,
	substrateMetadataRpc
);
