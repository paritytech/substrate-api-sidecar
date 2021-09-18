import { westendRuntimeCodeEndpoints } from './code';
import { westendRuntimeSpecEndpoints } from './spec';
import { westendRuntimeMetadataEndpoints } from './metadata';

export const westendRuntimeEndpoints = [
    ...westendRuntimeCodeEndpoints,
    ...westendRuntimeSpecEndpoints,
    ...westendRuntimeMetadataEndpoints
];
