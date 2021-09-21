import { westendRuntimeCodeEndpoints } from './code';
import { westendRuntimeMetadataEndpoints } from './metadata';
import { westendRuntimeSpecEndpoints } from './spec';

export const westendRuntimeEndpoints = [
	...westendRuntimeCodeEndpoints,
	...westendRuntimeSpecEndpoints,
	...westendRuntimeMetadataEndpoints,
];
