import runtimeSpec10000 from './10000.json';
import runtimeSpec2000000 from './2000000.json';
import runtimeSpec7417678 from './7417678.json';

export const westendRuntimeSpecEndpoints = [
	['/runtime/spec?at=10000', JSON.stringify(runtimeSpec10000)], // v1
	['/runtime/spec?at=2000000', JSON.stringify(runtimeSpec2000000)], // v41
	['/runtime/spec?at=7417678', JSON.stringify(runtimeSpec7417678)], // v9090
];
