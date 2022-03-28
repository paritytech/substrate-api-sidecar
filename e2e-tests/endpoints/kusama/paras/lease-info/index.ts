import parasLeaseInfo8500000 from './8500000.json';
import parasLeaseInfo9000000 from './9000000.json';
import parasLeaseInfo9800000 from './9800000.json';
import parasLeaseInfo10119301 from './10119301.json';
import parasLeaseInfo10819301 from './10819301.json';
import parasLeaseInfo11000000 from './11000000.json';
import parasLeaseInfo11100000 from './11100000.json';
import parasLeaseInfo11500000 from './11500000.json';
import parasLeaseInfo11800000 from './11800000.json';

export const parasLeaseInfoEndpoints = [
	['/paras/2007/lease-info?at=8500000', JSON.stringify(parasLeaseInfo8500000)], // v9070
	['/paras/2000/lease-info?at=9000000', JSON.stringify(parasLeaseInfo9000000)], // v9090
	['/paras/2023/lease-info?at=9800000', JSON.stringify(parasLeaseInfo9800000)], // v9111
	[
		'/paras/2023/lease-info?at=10119301',
		JSON.stringify(parasLeaseInfo10119301),
	], // v9122
	[
		'/paras/2023/lease-info?at=10819301',
		JSON.stringify(parasLeaseInfo10819301),
	], // v9130
	[
		'/paras/2096/lease-info?at=11000000',
		JSON.stringify(parasLeaseInfo11000000),
	], // v9150
	[
		'/paras/2096/lease-info?at=11100000',
		JSON.stringify(parasLeaseInfo11100000),
	], // v9151
	[
		'/paras/2096/lease-info?at=11500000',
		JSON.stringify(parasLeaseInfo11500000),
	], // v9160
	[
		'/paras/2096/lease-info?at=11800000',
		JSON.stringify(parasLeaseInfo11800000),
	], // v9170
];
