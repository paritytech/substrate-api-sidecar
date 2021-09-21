import runtimeCode10000 from './10000.json';
import runtimeCode7417678 from './7417678.json';

export const westendRuntimeCodeEndpoints = [
	['/runtime/code?at=10000', JSON.stringify(runtimeCode10000)], // v1
	['/runtime/code?at=7417678', JSON.stringify(runtimeCode7417678)], // v9090
];
