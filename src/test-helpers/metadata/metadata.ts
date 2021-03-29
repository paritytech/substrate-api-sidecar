import { Metadata } from '@polkadot/metadata';
import substrateMetadataRpc from '@polkadot/metadata/v11/static';

import { kusamaRegistry } from '../registries/kusamaRegistry';
import {
	polkadotRegistry,
	polkadotRegistryV29,
} from '../registries/polkadotRegistry';
import { polkadotMetadataRpcV16 } from './polkadotV16Metadata';
import { polkadotMetadataRpcV29 } from './polkadotV29Metadata';

/**
 * Metadata of the polkadotRegistry (v16).
 */
export const polkadotMetadata = new Metadata(
	polkadotRegistry,
	polkadotMetadataRpcV16
);

/**
 * Metadata of the kusamaRegistry (v2008).
 */
export const kusamaMetadata = new Metadata(
	kusamaRegistry,
	substrateMetadataRpc
);

/**
 * Metadata of polkadotRegistry (v29)
 */
export const polkadotMetadataV29 = new Metadata(
	polkadotRegistryV29,
	polkadotMetadataRpcV29
);
