import { Metadata } from '@polkadot/metadata';
import substrateMetadataRpc from '@polkadot/metadata/v11/static';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import {
	polkadotRegistry,
	polkadotV27Registry,
} from '../registries/polkadotRegistry';
import { polkadotV16MetadataRpc } from './polkadotV16Metadata';
import { polkadotV27MetadataRpc } from './polkadotV27Metadata';

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

export const polkadotV27Metadata = new Metadata(
	polkadotV27Registry,
	polkadotV27MetadataRpc
);
