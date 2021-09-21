import runtimeSpec10000 from './10000.json';
import runtimeSpec100000 from './100000.json';
import runtimeSpec2000000 from './2000000.json';
import runtimeSpec4000000 from './4000000.json';
import runtimeSpec8000000 from './8000000.json';

export const kusamaRuntimeSpecEndpoints = [
	['/runtime/spec?at=10000', JSON.stringify(runtimeSpec10000)], // v1020
	['/runtime/spec?at=100000', JSON.stringify(runtimeSpec100000)], // v1028
	['/runtime/spec?at=2000000', JSON.stringify(runtimeSpec2000000)], // v1055
	['/runtime/spec?at=4000000', JSON.stringify(runtimeSpec4000000)], // v2023
	['/runtime/spec?at=8000000', JSON.stringify(runtimeSpec8000000)], // v9040
];
