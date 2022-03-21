import block450000 from './450000.json';
import block650000 from './650000.json';
import block960000 from './960000.json';
import block993540 from './993450.json';
import block1100000 from './1100000.json';
import block1300000 from './1300000.json';
import block1800000 from './1800000.json';

export const statemineBlockEndpoints = [
	['/blocks/450000', JSON.stringify(block450000)], // v2
	['/blocks/650000', JSON.stringify(block650000)], // v3
	['/blocks/960000', JSON.stringify(block960000)], // v4
	['/blocks/993540', JSON.stringify(block993540)], // v5
	['/blocks/1100000', JSON.stringify(block1100000)], // v504
	['/blocks/1300000', JSON.stringify(block1300000)], // v601
	['/blocks/1800000', JSON.stringify(block1800000)], // v700
];
