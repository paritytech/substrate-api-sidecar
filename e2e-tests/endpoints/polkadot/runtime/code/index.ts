import runtimeCode10000 from './100000.json';
import runtimeCode6877002 from './6877002.json';

export const polkadotRuntimeCodeEndpoints = [
	['/runtime/code?at=100000', JSON.stringify(runtimeCode10000)], // v1
	['/runtime/code?at=6877002', JSON.stringify(runtimeCode6877002)], // v9090
];
