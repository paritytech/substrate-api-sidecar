import runtimeMetadata10000 from './10000.json';
import runtimeMetadata7417678 from './7417678.json';

export const westendRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=10000', JSON.stringify(runtimeMetadata10000)], // v1
	['/runtime/metadata?at=7417678', JSON.stringify(runtimeMetadata7417678)], // v9090
];
