import parasParas8400000 from './8400000.json';
import parasParas9400000 from './9400000.json';
import parasParas9800000 from './9800000.json';
import parasParas10119301 from './10119301.json';
import parasParas10819301 from './10819301.json';

export const parasParasEndpoints = [
	['/paras?at=8400000', JSON.stringify(parasParas8400000)], // v9070
	['/paras?at=9400000', JSON.stringify(parasParas9400000)], // v9090
	['/paras?at=9800000', JSON.stringify(parasParas9800000)], // v9111
	['/paras?at=10119301', JSON.stringify(parasParas10119301)], // v9122
	['/paras?at=10819301', JSON.stringify(parasParas10819301)], // v9130
];
