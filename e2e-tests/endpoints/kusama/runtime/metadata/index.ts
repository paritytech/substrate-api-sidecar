import runtimeMetadata10000 from './10000.json';
import runtimeMetadata8000000 from './8000000.json';

export const kusamaRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=10000', JSON.stringify(runtimeMetadata10000)], // v1020
	['/runtime/metadata?at=8000000', JSON.stringify(runtimeMetadata8000000)], // v9040
];
