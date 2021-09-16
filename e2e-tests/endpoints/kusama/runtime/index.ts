import { kusamaRuntimeSpecEndpoints } from './spec';
import { kusamaRuntimeMetadataEndpoints } from './metadata';

export const kusamaRuntimeEndpoints = [
    ...kusamaRuntimeSpecEndpoints, 
    ...kusamaRuntimeMetadataEndpoints
];
