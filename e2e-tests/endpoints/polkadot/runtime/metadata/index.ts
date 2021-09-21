import runtimeMetadata100000 from './100000.json';
import runtimeMetadata6877002 from './6877002.json';

export const polkadotRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=100000', JSON.stringify(runtimeMetadata100000)], // v1
	['/runtime/metadata?at=6877002', JSON.stringify(runtimeMetadata6877002)], // v9090
];
