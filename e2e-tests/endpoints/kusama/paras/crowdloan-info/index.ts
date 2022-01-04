import parasCrowdloanInfo8367200 from './8367200.json';
import parasCrowdloanInfo9000000 from './9000000.json';
import parasCrowdloanInfo9810000 from './9810000.json';
import parasCrowdloanInfo10119301 from './10119301.json';
import parasCrowdloanInfo10819301 from './10819301.json';

export const parasCrowdloanInfoEndpoints = [
	[
		'/paras/2023/crowdloan-info?at=8367200',
		JSON.stringify(parasCrowdloanInfo8367200),
	], // v9070
	[
		'/paras/2077/crowdloan-info?at=9000000',
		JSON.stringify(parasCrowdloanInfo9000000),
	], // v9090
	[
		'/paras/2077/crowdloan-info?at=9810000',
		JSON.stringify(parasCrowdloanInfo9810000),
	], // v9111
	[
		'/paras/2077/crowdloan-info?at=10119301',
		JSON.stringify(parasCrowdloanInfo10119301),
	], // v9122
	[
		'/paras/2008/crowdloan-info?at=10819301',
		JSON.stringify(parasCrowdloanInfo10819301),
	], // v9130
];
