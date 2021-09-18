import { kusamaRuntimeSpecEndpoints } from './spec';
import { kusamaRuntimeMetadataEndpoints } from './metadata';
import { kusamaRuntimeCodeEndpoints } from './code';

export const kusamaRuntimeEndpoints = [
    ...kusamaRuntimeCodeEndpoints,
    ...kusamaRuntimeSpecEndpoints, 
    ...kusamaRuntimeMetadataEndpoints
];
