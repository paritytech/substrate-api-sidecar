import parasLeasesCurrent8200000 from './8200000.json';
import parasLeasesCurrent9000000 from './9000000.json';
import parasLeasesCurrent9800000 from './9800000.json';
import parasLeasesCurrent10119301 from './10119301.json';
import parasLeasesCurrent10819301 from './10819301.json';

export const parasLeasesCurrentEndpoints = [
	[
		'/paras/leases/current?at=8200000',
		JSON.stringify(parasLeasesCurrent8200000),
	], // v9070
	[
		'/paras/leases/current?at=9000000',
		JSON.stringify(parasLeasesCurrent9000000),
	], // v9090
	[
		'/paras/leases/current?at=9800000',
		JSON.stringify(parasLeasesCurrent9800000),
	], // v9111
	[
		'/paras/leases/current?at=10119301',
		JSON.stringify(parasLeasesCurrent10119301),
	], // v9122
	[
		'/paras/leases/current?at=10819301',
		JSON.stringify(parasLeasesCurrent10819301),
	], // v9130
];
