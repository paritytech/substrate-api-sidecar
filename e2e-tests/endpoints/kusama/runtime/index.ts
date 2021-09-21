import { kusamaRuntimeCodeEndpoints } from './code';
import { kusamaRuntimeMetadataEndpoints } from './metadata';
import { kusamaRuntimeSpecEndpoints } from './spec';

export const kusamaRuntimeEndpoints = [
	...kusamaRuntimeCodeEndpoints,
	...kusamaRuntimeSpecEndpoints,
	...kusamaRuntimeMetadataEndpoints,
];
