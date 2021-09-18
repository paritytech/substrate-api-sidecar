import { polkadotRuntimeCodeEndpoints } from './code';
import { polkadotRuntimeMetadataEndpoints } from './metadata';
import { polkadotRuntimeSpecEndpoints } from './spec';

export const polkadotRuntimeEndpoints = [
	...polkadotRuntimeCodeEndpoints,
	...polkadotRuntimeSpecEndpoints,
	...polkadotRuntimeMetadataEndpoints,
];
