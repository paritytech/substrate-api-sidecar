import parasCrowdloans8200000 from './8200000.json';
import parasCrowdloans9800000 from './9800000.json';
import parasCrowdloans10119301 from './10119301.json';
import parasCrowdloans10819301 from './10819301.json';

export const parasCrowdloansEndpoints = [
	['/paras/crowdloans?at=8200000', JSON.stringify(parasCrowdloans8200000)], // v9070
	['/paras/crowdloans?at=9800000', JSON.stringify(parasCrowdloans9800000)], // v9111
	['/paras/crowdloans?at=10119301', JSON.stringify(parasCrowdloans10119301)], // v9122
	['/paras/crowdloans?at=10819301', JSON.stringify(parasCrowdloans10819301)], // v9130
];
