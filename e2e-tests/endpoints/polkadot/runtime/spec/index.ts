import runtimeSpec1000 from './1000.json';
import runtimeSpec200000 from './200000.json';
import runtimeSpec3000000 from './3000000.json';
import runtimeSpec6877002 from './6877002.json';

export const polkadotRuntimeSpecEndpoints = [
	['/runtime/spec?at=1000', JSON.stringify(runtimeSpec1000)], // v0
	['/runtime/spec?at=200000', JSON.stringify(runtimeSpec200000)], // v6
	['/runtime/spec?at=3000000', JSON.stringify(runtimeSpec3000000)], // v26
	['/runtime/spec?at=6877002', JSON.stringify(runtimeSpec6877002)], // v9090
];
