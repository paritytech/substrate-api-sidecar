import runtimeCode10000 from './10000.json';
import runtimeCode8000000 from './8000000.json';

export const kusamaRuntimeCodeEndpoints = [
	['/runtime/code?at=10000', JSON.stringify(runtimeCode10000)], // v1020
	['/runtime/code?at=8000000', JSON.stringify(runtimeCode8000000)], // v9040
];
