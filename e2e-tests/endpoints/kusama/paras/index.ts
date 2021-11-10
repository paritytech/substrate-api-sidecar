import { parasAuctionsCurrentEndpoints } from './auctions-current';
import { parasCrowdloanInfoEndpoints } from './crowdloan-info';
import { parasCrowdloansEndpoints } from './crowdloans';
import { parasLeaseInfoEndpoints } from './lease-info';
import { parasLeasesCurrentEndpoints } from './leases-current';
import { parasParasEndpoints } from './paras';

export const kusamaParasEndpoints = [
	...parasAuctionsCurrentEndpoints,
	...parasCrowdloanInfoEndpoints,
	...parasCrowdloansEndpoints,
	...parasLeaseInfoEndpoints,
	...parasLeasesCurrentEndpoints,
	...parasParasEndpoints,
];
