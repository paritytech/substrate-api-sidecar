import parasLeasesCurrent8200000 from './8200000.json';
import parasLeasesCurrent9000000 from './9000000.json';
import parasLeasesCurrent9800000 from './9800000.json';

export const parasLeasesCurrentEndpoints = [
	[
		'/paras/leases/current?at=8200000',
		JSON.stringify(parasLeasesCurrent8200000),
	],
	[
		'/paras/leases/current?at=9000000',
		JSON.stringify(parasLeasesCurrent9000000),
	],
	[
		'/paras/leases/current?at=9800000',
		JSON.stringify(parasLeasesCurrent9800000),
	],
];
