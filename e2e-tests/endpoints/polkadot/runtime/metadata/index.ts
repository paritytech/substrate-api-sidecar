import runtimeMetadata100000 from './100000.json';
import runtimeMetadata6877002 from './6877002.json';
import runtimeMetadata10090000 from './10090000.json';

export const polkadotRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=100000', JSON.stringify(runtimeMetadata100000)], // v1
	['/runtime/metadata?at=6877002', JSON.stringify(runtimeMetadata6877002)], // v9090 V13
	['/runtime/metadata?at=10090000', JSON.stringify(runtimeMetadata10090000)], // v9180 V14
];
