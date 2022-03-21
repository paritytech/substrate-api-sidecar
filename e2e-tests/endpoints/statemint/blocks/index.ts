import block10000 from './10000.json';
import block340000 from './340000.json';

export const statemintBlockEndpoints = [
	['/blocks/10000', JSON.stringify(block10000)], // v2
	['/blocks/340000', JSON.stringify(block340000)], // v601
];
