import parasCrowdloans8200000 from './8200000.json';
import parasCrowdloans9800000 from './9800000.json';

export const parasCrowdloansEndpoints = [
	[
		'/paras/crowdloans?at=8200000',
		JSON.stringify(parasCrowdloans8200000),
	],
	[
		'/paras/crowdloans?at=9800000',
		JSON.stringify(parasCrowdloans9800000),
	],
];
