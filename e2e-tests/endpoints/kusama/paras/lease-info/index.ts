import parasLeaseInfo8500000 from './8500000.json';
import parasLeaseInfo9000000 from './9000000.json';
import parasLeaseInfo9800000 from './9800000.json';
import parasLeaseInfo10119301 from './10119301.json';
import parasLeaseInfo10819301 from './10819301.json';

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
];
